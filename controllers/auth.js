const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")
const dotenv=require('dotenv').config()
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.signup = (req, res, next) => {
  console.log("start body", req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    console.log("before errrs");
    console.log("body", req.body);
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPwd) => {
      const user = new User({ email: email, password: hashedPwd, name: name });
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "User Created Successfully", _id: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        console.log("here500");
        statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    console.log("before errrs");
    console.log("body", req.body);
    throw error;
  }
  const { email, password } = req.body;
  let loadedUser;
//   if (!email || !password) {
//     return res.status(422).json({ message: "All fields are mandatory" });
//   }
    
  const user = User.findOne({ email })
    .then((user) => {
      if (!user) {
        const err = new Error("user does not exist");
        err.statusCode = 401;
        throw err;
      }
      loadedUser=user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const err = new Error("Password is wrong");
        err.statusCode = 401;
        throw err;
      }
      const token=jwt.sign({email:loadedUser.email,userId:loadedUser._id},process.env.PRIVATE_KEY,{expiresIn:'1h'})

      res.status(200).json({ message: "login successful" ,token:token,userId:loadedUser._id.toString()});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
