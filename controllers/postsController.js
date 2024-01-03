const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { body, validationResult } = require('express-validator');

const Post = require('../models/postModel');
const User = require('../models/userModel');

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ added: 1 });

  return res.json({ posts, count: posts.length });
});

exports.createPost = [
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Invalid Author')
    .trim()
    .escape()
    .custom(async (val) => {
      if (!ObjectId.isValid(val)) throw new Error('Invalid Author ID');
      const user = await User.findOne({ _id: val, role: 'author' });
      if (!user) throw new Error('Author not found');
    }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array(), type: 'bodyValidation' });

    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) return res.status(403).json({ err });
      const newPost = new Post({ title: req.body.title, content: req.body.content, author: req.body.author });
      await newPost.save();

      return res.json({ newPost });
    });
  })
];
