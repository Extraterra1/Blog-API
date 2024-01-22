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
