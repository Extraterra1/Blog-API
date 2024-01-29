const express = require('express');
const router = express.Router();
const setToken = require('../middleware/setToken');
const authController = require('../controllers/authController');
const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the Blog API' });
});

router.post('/login', authController.login);

router.post('/register', authController.register);

router.patch('/users/:id/upgrade', setToken, authController.upgradeUser);

router.get('/posts', postsController.getPosts);

router.get('/posts/:id', postsController.postDetail);

router.post('/posts/create', setToken, postsController.createPost);

router.delete('/posts/:id', setToken, postsController.deletePost);

router.patch('/posts/:id', setToken, postsController.editPost);

router.get('/users/:id/posts', postsController.getPostsByUser);

router.get('/users/:id/comments', setToken, commentsController.getCommentsByUser);

router.post('/comments/create', setToken, commentsController.createComment);

router.patch('/comments/:id', setToken, commentsController.editComment);

router.delete('/comments/:id', setToken, commentsController.deleteComment);

router.patch('/comments/:id/like', setToken, commentsController.likeComment);

router.delete('/comments/:id/like', setToken, commentsController.removeLike);

module.exports = router;
