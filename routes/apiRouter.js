const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

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
    return res.json({ message: 'user created', token: 'idk lol' });
  })
);

module.exports = router;
