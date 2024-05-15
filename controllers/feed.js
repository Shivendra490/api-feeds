const Post = require("../models/post");
const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  Post.find()
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Fectched posts successfully", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("validation failed , entered data is incorrect");
    error.statusCode = 422;
    throw error; //as this is sync code so throw error will exit this fn and go to next error handling middleware
  }
  if (!req.file) {
    const error = new Error("No image is provided");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  //store in db
  const post = new Post({
    title: title,
    // imageUrl: "images/cartoon.jpeg",
    imageUrl: imageUrl,
    content: content,
    creator: { name: "Shiv" },
  });
  post
    .save()
    .then((post) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      } //As we are in async promise chain so here throw err will not work or not go to next middleware so here we need to use next()
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log("postt", postId);

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Fetched Post", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
