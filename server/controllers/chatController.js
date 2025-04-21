const Chat = require('../models/Chat');
const asyncHandler = require('express-async-handler');

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ user: req.user.id })
    .sort({ lastMessageAt: -1 })
    .select('title lastMessageAt createdAt');

  res.status(200).json(chats);
});

// @desc    Get a single chat
// @route   GET /api/chats/:id
// @access  Private
const getChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the chat belongs to the user
  if (chat.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this chat');
  }

  res.status(200).json(chat);
});

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
const createChat = asyncHandler(async (req, res) => {
  // Create a default title if not provided
  const title = req.body.title || `Chat ${new Date().toLocaleDateString()}`;

  const chat = await Chat.create({
    title,
    user: req.user.id,
    messages: []
  });

  res.status(201).json(chat);
});

// @desc    Add a message to a chat
// @route   POST /api/chats/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { content, isUser = true } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the chat belongs to the user
  if (chat.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to modify this chat');
  }

  // Add the message
  chat.messages.push({
    content,
    isUser,
    timestamp: Date.now()
  });

  // Update the lastMessageAt field
  chat.lastMessageAt = Date.now();

  await chat.save();

  res.status(200).json(chat);
});

// @desc    Update a chat
// @route   PUT /api/chats/:id
// @access  Private
const updateChat = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the chat belongs to the user
  if (chat.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this chat');
  }

  chat.title = title;
  await chat.save();

  res.status(200).json(chat);
});

// @desc    Delete a chat
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the chat belongs to the user
  if (chat.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this chat');
  }

  await chat.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Delete a message from a chat
// @route   DELETE /api/chats/:id/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the chat belongs to the user
  if (chat.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to modify this chat');
  }

  // Find the message index
  const messageIndex = chat.messages.findIndex(
    (message) => message._id.toString() === req.params.messageId
  );

  if (messageIndex === -1) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Remove the message
  chat.messages.splice(messageIndex, 1);
  
  // Update the lastMessageAt field if there are still messages
  if (chat.messages.length > 0) {
    const lastMessage = chat.messages[chat.messages.length - 1];
    chat.lastMessageAt = lastMessage.timestamp;
  }

  await chat.save();

  res.status(200).json(chat);
});

module.exports = {
  getChats,
  getChat,
  createChat,
  addMessage,
  updateChat,
  deleteChat,
  deleteMessage
}; 