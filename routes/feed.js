const express = require("express");

const { body } = require("express-validator");

const router = express.Router();

const feedController = require("../controllers/feed");
const {verifyAuth}=require("../middlewares/verify-auth")

router.get("/posts",verifyAuth, feedController.getPosts);

router.post(
  "/post",
  verifyAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId",verifyAuth, feedController.getPost);

router.put(
  "/post/:postId",
  verifyAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId",verifyAuth,feedController.deletePost)

module.exports = router;
