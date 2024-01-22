const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    trim: true,
    required: 'Your comment cannot be empty'
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: 'You must provide a valid user id'
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: 'Post',
    required: 'You must provide a valid post id'
  },
  added: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    trim: true,
    default: 0
  }
});

module.exports = mongoose.model('Comment', commentSchema);
