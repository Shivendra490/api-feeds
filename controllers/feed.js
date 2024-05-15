const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  // res.setHeader("Content-Type", "application/json");
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({
          message: "Fectched posts successfully",
          posts: posts,
          totalItems: totalItems,
        });
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

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("Image File is missing");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.statusCode = 404;
        throw error;
      }
      console.log("imgurls", imageUrl, post.imageUrl);
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      console.log("updated result", result);
      res
        .status(200)
        .json({ message: "post Updated Successfully", post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("post does not exist");
        error.statusCode = 404;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      res.status(200).json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = fs.unlink(path.join(__dirname, "..", filePath), (err) => {
    console.log("file Deleted");
  });
};
