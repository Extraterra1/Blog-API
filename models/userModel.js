const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: 'Email address is required',
    unique: true,
    lowercase: true,
    validate: [validateEmail, 'Invalid email']
  },
  username: {
    type: String,
    trim: true,
    required: 'You must submit a username',
    minLength: 3,
    maxLength: 15
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'author']
  }
});

module.exports = mongoose.model('User', userSchema);
