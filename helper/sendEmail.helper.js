const nodemailer = require('nodemailer')
require("dotenv").config();
exports.sendEmail = async (email, body, subject) => {
  try {
    

    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

    let mailOptions = {
      from: "BUSA",
      to: email,
      subject,
      html: body,
    };

    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log("Error " + err);
      } else{
        console.log(data.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};