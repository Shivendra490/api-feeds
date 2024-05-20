const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");
const {verifyAuth}=require("../middlewares/verify-auth")

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userObj) => {
          if (userObj) {
            return Promise.reject("Email is already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.login
);

router.get("/status",verifyAuth,authController.getStatus)

router.patch("/status",verifyAuth,authController.updateStatus)

module.exports = router;
