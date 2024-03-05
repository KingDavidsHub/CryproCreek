const mongoose = require('mongoose')
const uuidv1 = require('uuidv1');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    username:{
      type: String,
      required: true
  },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
      type: String,
    },
    encry_password: {
        type: String,
        required: true
    },
    salt:String,
    role: {
        type: Number,
        default: 0
    },
    dateOfBirth: {
      type: String,
      
    },
    isVerified: {
      type: Boolean,
      default: false
    }

}, 
{ timestamps: true}
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "Input a strong password";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return err.message;
    }
  },
};

module.exports = mongoose.model("User", userSchema);