const {validationResult}=require('express-validator')

exports.getPosts = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  return res
    .status(200)
    .json({ posts: [{
      _id: new Date().toISOString(),
      title: "Ram title",
      content: "This is content",
      imageUrl:'images/cartoon.jpeg',
      creator: {name:"Shyam"},
      createdAt: new Date(),
    },] });
};

exports.createPost = (req, res, next) => {
  const errors=validationResult(req);
  console.log("check", errors);
  if(!errors.isEmpty()){
    return res.status(422).json({message:'validation failed , entered data is incorrect',errors:errors.array()})
  }
  const title = req.body.title;
  const content = req.body.content;
  //store in db
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: {name:"Ram"},
      createdAt: new Date(),
    },
  });
};
