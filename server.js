const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const formData = require("express-form-data");
const app = express();

require("dotenv").config

const uri = process.env.MONGO_URI;

console.log(uri);

async function connect() {
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log("connected to mongo DB");
  } catch (error) {
    console.log(error);
  }
}

connect();


app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(formData.parse());
// Basic Testing Purposes
app.get("/", (req, res) => {
  res.json({
    project_name: "Cryto Creek",
  });
});
