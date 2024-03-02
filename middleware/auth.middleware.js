const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.header = await User.findById(decoded._id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ 
        success: false,
        msg: "Session Expired",
      });
    }
  } 

  if (!token) {
    res.clearCookie("token");
    res.send({
      success: false,
      message: "Login required",
    });
  }
};

exports.userRoleAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded._id);
      
      if (user.role === 1 || user.role === 9) {
        next();
      }
    } catch (error) { 
      console.log(error);
      res.status(401).json({
        success: false,
        msg: "Session Expired",
      });
    }
  }

  if (!token) {
    res.clearCookie("token");
    res.status(400).json({
      success: false,
      message: "Login again",
    });
  }
};
