const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/userModel');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

router.post(
  '/login',
  body('username', 'Bad request').trim().isLength({ min: 2 }).optional(),
  body('email', 'Bad request').trim().isEmail().optional(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ err: errors.array()[0].msg });
    const user = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }]
    });
    if (!user) return res.status(401).json({ err: 'Wrong username/password' });
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) return res.status(401).json({ err: 'Wrong username/passwords' });
    const cleanUser = { email: user.email, username: user.username, role: user.role };
    jwt.sign({ user: cleanUser }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
);

router.post(
  '/register',
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
    const cleanUser = { email: newUser.email, username: newUser.username, role: newUser.role };
    jwt.sign({ user: cleanUser }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
);

module.exports = router;