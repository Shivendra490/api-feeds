const jwt = require("jsonwebtoken");

const dotenv = require("dotenv").config();

exports.verifyAuth = (req, res, next) => {
  try {
    const authToken = req.get('Authorization');
    console.log('thtoken',authToken)
    if (!authToken) {
      const err=new Error("Not Authenticated undefined")
      err.statusCode=401
      throw err
    }
    const token = authToken.split(" ")[1]; //or=req.get('Authorization').split(' ')[1] ,because of bearer

    let decodedToken = jwt.verify(token, process.env.PRIVATE_KEY);
    console.log("token", token, "decoded", decodedToken);

    if (!decodedToken) {
      const err = new Error("Not Authenticated");
      err.statusCode = 401;
      throw err;
    }

    const userId = decodedToken.userId;
    req.userId = userId;
    req.email=decodedToken.email
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
