const User = require('../models/user.model')
const { validationResult } = require("express-validator");
const Token = require("../models/token.model");
const moment =  require('moment')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const {sendEmail} = require("../helper/sendEmail.helper");




exports.signup = async (req,res) =>{
     try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(402).json({
            error: errors.array()[0].msg,
        });
        }
    
        const { email } = req.body;
        const user = await User.findOne({ email: email });

          if (user !== null) {
              // Handle case where email already exists
              return res.status(403).json({
              error: "Email already exists. Please proceed to sign in",
              });
          } else if (!user || user === null) {
              // Proceed with user registration
              const data = req.body;
              const user = new User({
              ...data,
              isVerified: false,
              });
      
              // Generate a random token and save it to the database
              const token = await new Token({
              token: Math.floor(Math.random() * 90000) + 10000,
              isUsed: false,
              email: req.body.email,
              expiryDate: moment(new Date()).add(45, "m").toDate(),
              }).save();
      
              await user.save();

              // #008080;

              const body = `<!DOCTYPE html>
              <html>
              <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width">
              <title>Email Verification</title>
              <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
              }
              
      
              .container {
                  width: 500px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
      
              h2 {
                  color: #008080;
              }
      
              p {
                  color: #666666;
              }
      
              .verification-code {
                  background-color: #f9f9f9;
                  border: 1px solid #dddddd;
                  padding: 10px;
                  margin-bottom: 20px;
              }
      
              .code {
                  font-weight: bold;
                  color: #008080;
              }
              .psy{
                color: #008080
              }
      
              .footer {
                  text-align: center;
                  color: #999999;
                  font-size: 12px;
              }
          </style>
              </head>
              <body>
              <div class="container">
          <h2>Email Verification</h2>
          <p>Thank you for signing up! To complete your registration, please enter the following verification code:</p>
          <div class="verification-code">
              <span class="code">${token.token}</span>
          </div>
          <p>If you did not request this verification code, please ignore this email.</p>
          <div class="footer">
              <p class = "psy">Psyminmal Limited</p>
          </div>
      </div>
              </body>
              </html>`


             

              await sendEmail(user.email, body, "Verify Account");

              res.status(200).json({
                success: true,
                data: user
              })
          

      
          }
      } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
     }

}


exports.verifyToken = async(req,res) =>{
    try {
        const { token } = req.body;
        let check = await Token.findOne({
          token: token,
        });
      
        if (!check) {
          res.status(400).json({
            message: "Token not found in the Database",
          });
        }
      
       else if (check.expiryDate < new Date()) {
          res.status(400).json({
            message: "Token expired. Hit Resend to get a new token",
          });
       } else if (check.isUsed === true) {
          res.status(400).json({
            success: false,
            message: "Token already used. Sign up Again",
          });
        } else {
          check.isUsed = true;
          await User.findOne({
            email: check.email,
          }).updateOne({
            isVerified: true,
          });
          await Token.findByIdAndDelete(check._id);

          return res.status(200).send({
            message: "User verified successfully",
          });
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.resendCode = async (req,res) =>{
    try {
    const { email } = req.body;
    
    const token = await new Token({
      token: Math.floor(Math.random() * 90000) + 10000,
      isUsed: false,
      email: req.body.email,
      expiryDate: moment(new Date()).add(45, "m").toDate(),
    }).save();

    const body = `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Email Verification</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
    }
    

    .container {
        width: 500px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    h2 {
        color: #008080;
    }

    p {
        color: #666666;
    }

    .verification-code {
        background-color: #f9f9f9;
        border: 1px solid #dddddd;
        padding: 10px;
        margin-bottom: 20px;
    }

    .code {
        font-weight: bold;
        color: #008080;
    }
    .psy{
      color: #008080
    }

    .footer {
        text-align: center;
        color: #999999;
        font-size: 12px;
    }
</style>
    </head>
    <body>
    <div class="container">
<h2>Email Verification</h2>
<p>Thank you for signing up! To complete your registration, please enter the following verification code:</p>
<div class="verification-code">
    <span class="code">${token.token}</span>
</div>
<p>If you did not request this verification code, please ignore this email.</p>
<div class="footer">
    <p class = "psy">Psyminmal Limited</p>
</div>
</div>
    </body>
    </html>`;

    sendEmail(email,body,"Verify Email")

    res.status(200).json({
      success: true,
    });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: true,
            message: error.message
        })
    }
}

exports.signin = async (req,res) =>{
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
         
        if (!user || user === null) {
          return res.status(400).json({
              error: "This user does not exist",
          });
          }

          if (!user.authenticate(password)) {
          return res.status(401).json({
              error: "Email and password does not match",
          });
          }

          

          // create a token
          const refreshToken = jwt.sign(
          { _id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          {
              expiresIn: "10d",
          }
          );

          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "240h",
          });
          // Put token in cookie
          res.cookie("refreshToken", refreshToken, {
          expire: new Date() + 10 * 1000 * 60 * 60 * 24,
          });
          res.cookie("token", token, { expire: new Date() + 240 *60 * 60 * 1000 });

          // Send response to front end
          const {
          _id,
          isVerified,
          role,
          firstname,
          lastname,
          gender
          } = user;
          return res.json({
          token,
          refreshToken,
          user: {
              _id,
              isVerified,
              email,
              role,
              firstname,
              lastname,
              gender,
          }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.isVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);


    if ( !user || user === null) {
        return res.status(400).json({
          error: "User does not exists",
        });
    }
    
    if (user.isVerified === true) {
      res.status(200).json({
        success: true,
        msg: "User should update his or her details",
      });
    } else if(user.isVerified == false){

      res.status(400).json({
        success: false,
        msg: "Click Resend Code"
      });
    }
  } catch (error) {
    console.log(error);
  }
  next();
};


exports.resetPassword = async (req,res) =>{
  try {
    const {email, newPassword, confirmPassword} = req.body

    const user =  await User.findOne({ email })

      if (!user || user === null) {
        console.log(err)
        return res.status(400).json({
          error: "Email does not exist",
        });
      }
  
       if(user){
        if (!newPassword) {
          return res.status(200).json({
            message: "Please input a valid password",
          });
          
        
        }
        if (newPassword !== confirmPassword) {
          return res.status(400).json({
            error: "Passwords do not match",
          });
        }
        if (newPassword.length < 6) {
          return res.json({
            error: "Password should be at least 6 characters",
          });
        }
    
        let newEncryPassword = user.securePassword(newPassword);
    
        if (!user) {
          return res.status(400).json({
            error: "No user exists",
          });
        }
    
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            encry_password: newEncryPassword,
          }
        );

        
            if (!updatedUser.encry_password) {
              res.status(400).json({
                success: false,
                message: "Unable to update password",
              });
            } else if(updatedUser.encry_password){
              
                const body = `<!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <title>Password Reset Successful🎉</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                }

                .container {
                    width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                h2 {
                    color: #333333;
                }

                p {
                    color: #666666;
                }

                .verification-code {
                    background-color: #f9f9f9;
                    border: 1px solid #dddddd;
                    padding: 10px;
                    margin-bottom: 20px;
                }

                .code {
                    font-weight: bold;
                    color: #008080;
                }

                .footer {
                    text-align: center;
                    color: #999999;
                    font-size: 12px;
                }

                .psy{
                  color: #008080
                }
            </style>
                </head>
                <body>
                <div class="container">
            <h2>Email Verification</h2>
            <div class="verification-code">
                <span class="code">Your Password was reset successfully🎉</span>
            </div>
            <p>If you did not request this verification code, please ignore this email.</p>
            <div class="footer">
                <p class ="psy">Psyminimal Limited</p>
            </div> 
            </div>
                </body>
                </html>
                `;

      sendEmail(user.email, body,"Password reset Successful")

      res.status(200).json({
        success: true,
        message:"Password reset successful"
      })
            
  
    }
    
      
  }
  
} catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal Error Occured"
    })
  }
}

exports.changePassWord = async (req,res) =>{
  try {
    const {email, password, newPassword} = req.body

     const user = await User.findOne({ email })
     
      if (user === null || !user) {
        return res.status(400).json({
          error: "Email does not exist",
        });
      }
  
      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: "Email and password does not match",
        });
      } else if(user.authenticate(password)){
        if (!newPassword) {
          return res.status(200).json({
            message: "Please input a valid password",
          });
          
        
        }
        if (password == newPassword) {
          return res.status(203).json({
            message: "Passwords must not match",
          });
        }
        if (newPassword.length < 6) {
          return res.json({
            error: "Password should be at least 6 characters",
          });
        }
    
        let encryPassword = user.securePassword(password);
    
        if (encryPassword !== user.encry_password) {
          return res.json({
            error:
              "Enter your current password. If forgotten, click forgot password",
          });
        }
    
        let newEncryPassword = user.securePassword(newPassword);
        
        if (newEncryPassword === user.encry_password) {
          return res.json({
            error: "Your new password must be different from the previous",
          });
        }
    
        if (!user) {
          return res.status(400).json({
            error: "No user exists",
          });
        }
    
       const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            encry_password: newEncryPassword,
          },
          
        );
          
        if (!updatedUser.encry_password) {
            res.status(400).json({
              success: false,
              message: "Unable to update password",
            });
          } else if( updatedUser.encry_password){
            
                      const body = `<!DOCTYPE html>
                  <html>
                      <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width">
                      <title>Password change Successful🎉</title>
                    <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f5f5f5;
                      }

                      .container {
                          width: 500px;
                          margin: 0 auto;
                          padding: 20px;
                          background-color: #ffffff;
                          border-radius: 5px;
                          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                      }

                      h2 {
                          color: #008080;
                      }

                      p {
                          color: #666666;
                      }

                      .verification-code {
                          background-color: #f9f9f9;
                          border: 1px solid #dddddd;
                          padding: 10px;
                          margin-bottom: 20px;
                      }

                      .code {
                          font-weight: bold;
                          color: #008080;
                      }

                      .footer {
                          text-align: center;
                          color: #999999;
                          font-size: 12px;
                      }

                      .psy{
                        color: #008080
                      }
                  </style>
                      </head>
                  <body>
                      <div class="container">
                    <h2>Email Verification</h2>
                    <div class="verification-code">
                      <span class="code">Your Password was changed successfully🎉</span>
                    </div>
                    <p>If you did not request this verification code, please ignore this email.</p>
                    <div class="footer">
                      <p class = "psy">Psyminimal Limited</p>
                    </div> 
                    </div>
                  </body>
               </html>
                      `;

  sendEmail(user.email, body,"Password Change Successful")

  res.status(200).json({
    success: true,
    message:"Password Change successful"
  })
      
        }
    
      }
    
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal Error Occured"
    })
  }
}

exports.forgotPassWord = async (req,res) =>{
  try {
    const { email } = req.body

    const token = await new Token({
      token: Math.floor(Math.random() * 90000) + 10000,
      isUsed: false,
      email: req.body.email,
      expiryDate: moment(new Date()).add(45, "m").toDate(),
    }).save();

    const user = await User.findOne({ email })


      if (user === null || !user) {
        return res.status(400).json({
          error: "Email does not exist",
        });
      } else {
                const body = `<!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <title>Email Verification</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                }

                .container {
                    width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                h2 {
                    color: #008080;
                }

                p {
                    color: #666666;
                }

                .verification-code {
                    background-color: #f9f9f9;
                    border: 1px solid #dddddd;
                    padding: 10px;
                    margin-bottom: 20px;
                }

                .code {
                    font-weight: bold;
                    color: #008080;
                }

                .footer {
                    text-align: center;
                    color: #999999;
                    font-size: 12px;
                }

                .psy{ 
                  color: #008080
                }
            </style>
                </head>
                <body>
                <div class="container">
            <h2>Email Verification</h2>
            <p>Thank you for signing up! To complete your registration, please enter the following verification code:</p>
            <div class="verification-code">
                <span class="code">${token.token}</span>
            </div>
            <p>If you did not request this verification code, please ignore this email.</p>
            <div class="footer">
                <p class = "psy">Psyminimal Limited</p>
            </div>
        </div>
                </body>
                </html>
                `;
        sendEmail(email,body,"Verify Email")

        return res.status(200).json({
        success: true,
        message:"Token Sent successfully"
        })
  


      
  }
 
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal Error Occured"
    })
  }
}

