const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getChats,
  getChat,
  createChat,
  addMessage,
  updateChat,
  deleteChat,
  deleteMessage
} = require('../controllers/chatController');

// Routes for chats
router.route('/')
  .get(protect, getChats)
  .post(protect, createChat);

router.route('/:id')
  .get(protect, getChat)
  .put(protect, updateChat)
  .delete(protect, deleteChat);

// Routes for messages within a chat
router.route('/:id/messages')
  .post(protect, addMessage);

router.route('/:id/messages/:messageId')
  .delete(protect, deleteMessage);

module.exports = router; 