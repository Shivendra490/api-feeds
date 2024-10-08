const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .populate("creator", "name") //this will include only _id,and name of user ,if you did not give name then it will fetch all details of user
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
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
  let creator;

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
    creator: req.userId,
  });
  let newPost;
  post
    .save()
    .then((pst) => {
      newPost=pst
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const err = new Error("something went wrong");
        throw err;
      }
      creator = user;
      user.posts.push(post); //we can also use post id but here mongoose will get pull id from post and save postId in user collection in db

      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: newPost,
        creator: { _id: creator._id, name: creator.name },
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
      if (post.creator.toString() !== req.userId.toString()) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
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
      if (post.creator.toString() !== req.userId.toString()) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
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
