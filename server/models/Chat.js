const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required']
  },
  isUser: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
chatSchema.index({ user: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema); 