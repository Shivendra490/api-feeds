exports.getPosts = (req, res, next) => {
    res.setHeader('Content-Type','application/json')
  return res.status(200).json({ posts: [{ id: 1234,title: "party",content:"first post"  }] });
};

exports.createPost = (req, res, next) => {
    console.log('check',req.body)
  const title = req.body.title;
  const content = req.body.content;
  //store in db
  res
    .status(201)
    .json({
      message: "Post created successfully",
      post: { id: new Date().toISOString(), title: title, content: content },
    });
};
