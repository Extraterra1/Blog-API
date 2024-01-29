const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const util = require('util');
const moment = require('moment');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const User = require('../models/userModel');

const verifyAsync = util.promisify(jwt.verify);

exports.verifyAsync = verifyAsync;

exports.login = [
  body('username', 'Bad request').trim().isLength({ min: 2 }).optional(),
  body('email', 'Bad request').trim().isEmail().optional(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array()[0].msg });

    const user = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.username }]
    });

    if (!user) return res.status(401).json({ err: { message: 'Wrong username/password' } });

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) return res.status(401).json({ err: { message: 'Wrong username/passwords' } });

    const cleanUser = { email: user.email, username: user.username, role: user.role, id: user._id };
    jwt.sign({ user: cleanUser, exp: moment().add(3, 'days').unix() }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
];

exports.register = [
  body('email')
    .trim()
    .isEmail()
    .custom(async (val) => {
      const emailExists = await User.findOne({ email: val });
      if (emailExists) throw new Error('Email is already in use');
    }),
  body('username')
    .trim()
    .isLength({ min: 2, max: 15 })
    .withMessage('Username must be between 2 and 15 characters long')
    .custom(async (val) => {
      const usernameExists = await User.findOne({ username: val });
      if (usernameExists) throw new Error('Username already exists');
    }),
  body('password', 'Password must be at least 6 characters long').trim().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array(), type: 'bodyValidation' });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username
    });
    await newUser.save();

    const cleanUser = { email: newUser.email, username: newUser.username, role: newUser.role, id: newUser._id };
    jwt.sign({ user: cleanUser, exp: moment().add(3, 'days').unix() }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
];

exports.upgradeUser = [
  body('key', 'Wrong upgrade key').trim().isLength({ min: 2 }).equals('supersecret'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array(), type: 'bodyValidation' });

    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ err: { message: 'Invalid User' } });

    const tokenData = await verifyAsync(req.token, process.env.JWT_SECRET);
    if (tokenData.user.id !== req.params.id) return res.status(401).json({ err: 'Unauthorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ err: { message: 'User not Found' } });
    if (user.role === 'author') return res.status(400).json({ err: { message: 'User is already an author' } });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: 'author' }, { new: true }).select({ password: false });
    const cleanUser = { email: updatedUser.email, username: updatedUser.username, role: updatedUser.role, id: updatedUser._id };

    jwt.sign({ user: cleanUser, exp: moment().add(3, 'days').unix() }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
];
