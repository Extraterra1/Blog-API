const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }]
    });
    if (!user) return res.status(403).json({ err: 'Wrong username/password' });
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) return res.status(403).json({ err: 'Wrong username/passwordss' });
    const cleanUser = { email: user.email, username: user.username, role: user.role };
    jwt.sign({ user: cleanUser }, process.env.JWT_SECRET, (err, token) => {
      if (err) return res.status(500).json({ err });
      return res.json({ token, user: cleanUser });
    });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
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
