const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { body, validationResult } = require('express-validator');
const authController = require('./authController.js');

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
    const comment = await newComment.save();
    if (comment) await Post.findByIdAndUpdate(req.body.post, { $push: { comments: comment._id } });

    await newComment.populate('author');

    return res.json({ newComment });
  })
];

exports.deleteComment = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Comment' } });
  const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ err: 'Comment not found' });
  if (tokenData.user.role !== 'author' && tokenData.user.id !== comment.author.toString())
    return res.status(401).json({ err: 'You must be the author of the comment or an authorized poster in order to delete it.' });

  const deletedComment = await Comment.findByIdAndDelete(req.params.id);
  if (deletedComment) await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });

  return res.json({ deletedComment });
});

exports.editComment = [
  body('content', 'Comment must not be empty').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ err: { message: 'Invalid Comment' } });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ err: 'Comment not found' });

    const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);
    if (tokenData.user.role !== 'author' && tokenData.user.id !== comment.author.toString())
      return res.status(401).json({ err: 'You must be the author of the comment or an authorized poster in order to edit.' });

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, { content: req.body.content }, { new: true }).populate('author');
    if (!updatedComment) return res.status(404).json({ err: { message: 'Something went wrong' } });

    return res.json({ updatedComment });
  })
];

exports.likeComment = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Comment' } });
  const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);

  const isAlreadyLiked = await Comment.findOne({ _id: req.params.id, likes: tokenData.user.id });
  if (isAlreadyLiked) return res.json({ isAlreadyLiked, msg: `User ${tokenData.user.username} already liked that comment` });

  const likedComment = await Comment.findByIdAndUpdate(req.params.id, { $push: { likes: tokenData.user.id } }, { new: true });
  if (!likedComment) return res.status(404).json({ err: 'Comment not found' });

  return res.json({ likedComment });
});

exports.removeLike = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Comment' } });
  const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);

  const updatedComment = await Comment.findByIdAndUpdate(req.params.id, { $pull: { likes: tokenData.user.id } }, { new: true });
  if (!updatedComment) return res.status(404).json({ err: 'Comment not found' });

  return res.json({ updatedComment });
});
