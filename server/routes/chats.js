const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/chats
 * @desc    Get all chat sessions for a user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt');

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/chats/:id
 * @desc    Get a single chat session with messages
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if chat belongs to user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/chats
 * @desc    Create a new chat session
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    // Default title if not provided
    const title = req.body.title || 'New Conversation';
    
    // Create chat
    const chat = await Chat.create({
      title,
      user: req.user.id,
      messages: [],
      lastMessageAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/chats/:id/messages
 * @desc    Add a message to a chat
 * @access  Private
 */
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { content, isUser } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if chat belongs to user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add messages to this chat'
      });
    }

    // Create new message
    const message = {
      content,
      isUser: isUser === undefined ? true : isUser,
      timestamp: Date.now()
    };

    // Add message to chat
    chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { messages: message },
        $set: { lastMessageAt: Date.now() }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      chat
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/chats/:id
 * @desc    Update chat title
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    let chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if chat belongs to user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this chat'
      });
    }

    // Update chat
    chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { $set: { title } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Chat updated successfully',
      chat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/chats/:id
 * @desc    Delete a chat
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if chat belongs to user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    // Delete chat
    await chat.remove();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/chats/:id/messages/:messageId
 * @desc    Delete a message from a chat
 * @access  Private
 */
router.delete('/:id/messages/:messageId', protect, async (req, res) => {
  try {
    let chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if chat belongs to user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete messages from this chat'
      });
    }

    // Delete message from chat
    chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { $pull: { messages: { _id: req.params.messageId } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      chat
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router; 