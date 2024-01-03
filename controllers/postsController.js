const asyncHandler = require('express-async-handler');

const Post = require('../models/postModel');

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ added: 1 });

  return res.json({ posts, count: posts.length });
});
