const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

router.post('/login', authController.login);

router.post('/register', authController.register);

module.exports = router;
