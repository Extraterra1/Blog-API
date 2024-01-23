const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { body, validationResult } = require('express-validator');
const authController = require('./authController');

const Post = require('../models/postModel');
const User = require('../models/userModel');

const imgRegex =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ added: 1 }).populate('author');

  return res.json({ posts, count: posts.length });
});

exports.postDetail = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Post' } });

  const post = await Post.findById(req.params.id)
    .populate('author')
    .populate({ path: 'comments', populate: { path: 'author' }, options: { sort: { added: -1 } } });
  if (!post) return res.status(404).json({ err: { message: 'Post not found' } });

  return res.json({ post });
});

exports.getPostsByUser = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid User' } });

  const posts = await Post.find({ author: req.params.id }).populate('author');
  if (posts.length === 0) return res.json({ posts, msg: 'No posts by this author' });

  return res.json({ posts });
});

exports.createPost = [
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty').trim().isLength({ min: 1 }).escape(),
  body('imgUrl', 'Invalid Image URL').trim().optional().matches(imgRegex),
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

    const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);
    if (tokenData.user.role !== 'author') return res.status(403).json({ err: { message: 'You need to be an author to create a post' } });

    const newPost = new Post({ title: req.body.title, content: req.body.content, author: req.body.author, imgUrl: req.body.imgUrl });
    await newPost.save();

    return res.json({ newPost });
  })
];

exports.deletePost = asyncHandler(async (req, res) => {
  const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);
  if (tokenData.user.role !== 'author') return res.status(403).json({ err: { message: 'You need to be an author to delete a post' } });

  if (!ObjectId.isValid(req.params.id)) return res.status(401).json({ err: { message: 'Invalid Post' } });

  const deletedPost = await Post.findByIdAndDelete(req.params.id);
  if (!deletedPost) return res.status(404).json({ err: { message: 'Post not found' } });

  return res.json({ deletedPost });
});

exports.editPost = [
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('imgUrl', 'Invalid Image URL').trim().optional().matches(imgRegex),
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

    const tokenData = await authController.verifyAsync(req.token, process.env.JWT_SECRET);
    if (tokenData.user.role !== 'author') return res.status(403).json({ err: { message: 'You need to be an author to edit a post' } });

    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ err: { message: 'Invalid Post' } });

    const post = { title: req.body.title, content: req.body.content, author: req.body.author, _id: req.params.id, imgUrl: req.body.imgUrl };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, post, { new: true });
    if (!updatedPost) return res.status(404).json({ err: { message: 'Post not found' } });

    return res.json({ updatedPost });
  })
];
