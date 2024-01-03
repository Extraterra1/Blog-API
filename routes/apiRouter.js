const express = require('express');
const router = express.Router();
const setToken = require('../middleware/setToken');
const authController = require('../controllers/authController');
const postsController = require('../controllers/postsController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/posts', postsController.getPosts);

router.post('/posts/create', setToken, postsController.createPost);

router.delete('/posts/:id', setToken, postsController.deletePost);

router.put('/posts/:id', setToken, postsController.editPost);

module.exports = router;
