const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { body, validationResult } = require('express-validator');

const Comment = require('../models/CommentModel.js');

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
