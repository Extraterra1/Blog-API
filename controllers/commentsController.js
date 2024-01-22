const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { body, validationResult } = require('express-validator');

const Comment = require('../models/CommentModel.js');
const User = require('../models/userModel.js');
const Post = require('../models/postModel.js');

exports.getComments = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Post' } });
  const comments = await Comment.find({ post: req.params.id });

  return res.json({ comments });
});

exports.getCommentsByUser = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid User' } });

  const posts = await Comment.find({ author: req.params.id }).populate('author');
  if (posts.length === 0) return res.json({ posts, msg: 'No comments by this author' });

  return res.json({ posts });
});

exports.createComment = [
  body('content', 'Content must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Invalid Author')
    .trim()
    .escape()
    .custom(async (val) => {
      if (!ObjectId.isValid(val)) throw new Error('Invalid Author ID');
      const user = await User.findOne({ _id: val });
      if (!user) throw new Error('Author not found');
    }),
  body('post', 'Invalid Post')
    .trim()
    .escape()
    .custom(async (val) => {
      if (!ObjectId.isValid(val)) throw new Error('Invalid Post ID');
      const post = await Post.findOne({ _id: val });
      if (!post) throw new Error('Post not found');
    }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array(), type: 'bodyValidation' });

    const newComment = new Comment({ content: req.body.content, author: req.body.author, post: req.body.post });
    await newComment.save();

    return res.json({ newComment });
  })
];
