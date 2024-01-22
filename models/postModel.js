const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: 'You must provide a title for your blog post'
  },
  content: {
    type: String,
    trim: true,
    required: 'You must provide content for your blog post'
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: 'You must provide a valid user id'
  },
  added: {
    type: Date,
    default: Date.now
  },
  imgUrl: {
    type: String,
    trim: true
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports = mongoose.model('Post', postSchema);
