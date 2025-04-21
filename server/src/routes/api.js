const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * @route   POST /api/chat/message
 * @desc    Process a message and generate a response
 * @access  Public
 */
router.post('/chat/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const result = await chatController.processMessage(message);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Process message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      response: {
        text: "I'm sorry, I'm having trouble understanding right now. Could you try rephrasing?",
        detectedEmotion: 'unknown',
        confidence: 0
      }
    });
  }
});

/**
 * @route   POST /api/chat/analyze
 * @desc    Analyze sentiment of a message without generating a response
 * @access  Public
 */
router.post('/chat/analyze', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const sentiment = await chatController.analyzeMessage(message);
    
    res.status(200).json({
      success: true,
      sentiment
    });
  } catch (error) {
    console.error('Analyze message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/chat/status
 * @desc    Get status of the sentiment model
 * @access  Public
 */
router.get('/chat/status', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      isModelReady: chatController.isModelReady,
      isModelTraining: chatController.isModelTraining
    });
  } catch (error) {
    console.error('Get model status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/speech/synthesize
 * @desc    Proxy endpoint to Python speech synthesis API
 * @access  Public
 */
router.post('/speech/synthesize', (req, res) => {
  // Forward request to Python API
  const pythonApiUrl = 'http://localhost:5000/api/speech/synthesize';
  
  // Use fetch to forward the request
  fetch(pythonApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
  .then(response => response.json())
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Speech synthesis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error forwarding request to speech API'
    });
  });
});

/**
 * @route   POST /api/speech/recognize
 * @desc    Proxy endpoint to Python speech recognition API
 * @access  Public
 */
router.post('/speech/recognize', (req, res) => {
  // Forward request to Python API
  const pythonApiUrl = 'http://localhost:5000/api/speech/recognize';
  
  // Use fetch to forward the request
  fetch(pythonApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
  .then(response => response.json())
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Speech recognition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error forwarding request to speech API'
    });
  });
});

/**
 * @route   GET /api/speech/status
 * @desc    Proxy endpoint to check speech API status
 * @access  Public
 */
router.get('/speech/status', (req, res) => {
  // Forward request to Python API
  const pythonApiUrl = 'http://localhost:5000/api/speech/status';
  
  // Use fetch to forward the request
  fetch(pythonApiUrl)
  .then(response => response.json())
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Speech API status error:', error);
    res.status(500).json({
      success: false,
      tts_supported: false,
      asr_supported: false,
      message: 'Speech API is not available'
    });
  });
});

module.exports = router; 