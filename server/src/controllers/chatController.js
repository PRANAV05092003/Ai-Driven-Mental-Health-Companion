const SentimentModel = require('../models/sentimentModel');
const path = require('path');
const fs = require('fs');

class ChatController {
  constructor() {
    this.sentimentModel = new SentimentModel();
    this.modelPath = path.join(__dirname, '../../models/sentiment');
    this.isModelReady = false;
    this.isModelTraining = false;
    
    // Initialize the model
    this.initialize();
  }

  async initialize() {
    try {
      // Check if model exists
      if (fs.existsSync(path.join(this.modelPath, 'model.json'))) {
        // Load the existing model
        await this.loadModel();
      } else {
        // Use fallback sentiment analysis
        console.log('No pre-trained model found. Using fallback sentiment analysis.');
        this.isModelReady = true;
      }
    } catch (error) {
      console.error('Error initializing model:', error);
      this.isModelReady = true; // Use fallback
    }
  }

  async loadModel() {
    try {
      const success = await this.sentimentModel.loadModel(this.modelPath);
      this.isModelReady = success;
      console.log(success ? 'Model loaded successfully' : 'Failed to load model, using fallback');
    } catch (error) {
      console.error('Error loading model:', error);
      this.isModelReady = true; // Use fallback
    }
  }

  async trainModel(trainingPath, validationPath, testPath) {
    // Prevent multiple training sessions
    if (this.isModelTraining) {
      return { success: false, message: 'Model is already being trained' };
    }

    try {
      this.isModelTraining = true;
      
      console.log('Starting model training...');
      const success = await this.sentimentModel.train(trainingPath, validationPath);
      
      if (success) {
        // Create model directory if it doesn't exist
        if (!fs.existsSync(this.modelPath)) {
          fs.mkdirSync(this.modelPath, { recursive: true });
        }
        
        // Save the model
        await this.sentimentModel.saveModel(this.modelPath);
        this.isModelReady = true;
        
        // Test model accuracy
        if (testPath) {
          console.log('Evaluating model on test data...');
          // For a real implementation, add model evaluation logic here
        }
        
        return { success: true, message: 'Model trained and saved successfully' };
      } else {
        return { success: false, message: 'Model training failed' };
      }
    } catch (error) {
      console.error('Error training model:', error);
      return { success: false, message: 'Error training model: ' + error.message };
    } finally {
      this.isModelTraining = false;
    }
  }

  async analyzeMessage(message) {
    try {
      if (!message || typeof message !== 'string') {
        return { emotion: 'unknown', probability: 0 };
      }

      let sentimentResult;
      
      if (this.isModelReady && this.sentimentModel.model) {
        // Use the trained model
        sentimentResult = await this.sentimentModel.predict(message);
      } else {
        // Use fallback sentiment analysis
        sentimentResult = this.sentimentModel.analyzeSentimentFallback(message);
      }
      
      return sentimentResult;
    } catch (error) {
      console.error('Error analyzing message:', error);
      return { emotion: 'unknown', probability: 0 };
    }
  }

  async generateResponse(message, userSentiment) {
    // Basic response templates based on detected emotion
    const responseTemplates = {
      'sadness': [
        "I'm sorry to hear you're feeling down. Would you like to talk more about what's bothering you?",
        "It sounds like you're going through a difficult time. Remember that it's okay to feel sad sometimes.",
        "I hear that you're feeling sad. What's one small thing that might help you feel a little better right now?",
        "When we feel sad, it's important to be gentle with ourselves. Is there someone supportive you could reach out to?"
      ],
      'joy': [
        "It's wonderful to hear you're feeling positive! What's contributing to your good mood?",
        "I'm glad you're feeling happy! Would you like to share more about what's going well?",
        "That's great! Noticing and appreciating positive emotions can help us build resilience.",
        "Your positive energy is wonderful. How can you carry this good feeling forward?"
      ],
      'love': [
        "It sounds like you're experiencing feelings of connection and warmth, which is beautiful.",
        "Those feelings of love and connection are so important for our wellbeing.",
        "Having loving feelings is one of life's greatest gifts. Would you like to reflect more on this?",
        "It's wonderful that you're experiencing such positive feelings of connection."
      ],
      'anger': [
        "I can sense some frustration in your message. Would it help to talk more about what's bothering you?",
        "It sounds like you're feeling angry, which is a normal reaction to difficult situations.",
        "When we feel angry, it can be helpful to take a few deep breaths. Would you like to try a quick breathing exercise?",
        "I hear that you're feeling frustrated. What do you think triggered these feelings?"
      ],
      'fear': [
        "It sounds like you might be feeling anxious or worried. Would it help to explore these feelings?",
        "Fear is our body's way of trying to protect us. What's causing you to feel this way?",
        "When anxiety shows up, it can be helpful to ground ourselves. Would you like to try a grounding exercise?",
        "I hear that you're feeling nervous. Remember that it's okay to take things one step at a time."
      ],
      'surprise': [
        "That seems unexpected! Would you like to talk more about what surprised you?",
        "Unexpected events can sometimes throw us off balance. How are you processing this surprise?",
        "I sense that something unexpected has happened. Would you like to share more about it?",
        "Surprises can be both positive and challenging. How are you feeling about this unexpected situation?"
      ],
      'unknown': [
        "Thank you for sharing. How are you feeling today?",
        "I'm here to listen. Would you like to tell me more about what's on your mind?",
        "I appreciate you reaching out. What would be most helpful for you right now?",
        "I'm here to support you. Is there something specific you'd like to explore today?"
      ]
    };

    // Select a random response from the appropriate template
    const emotion = userSentiment.emotion || 'unknown';
    const templates = responseTemplates[emotion] || responseTemplates.unknown;
    const randomIndex = Math.floor(Math.random() * templates.length);
    
    return {
      text: templates[randomIndex],
      detectedEmotion: emotion,
      confidence: userSentiment.probability || 0
    };
  }

  async processMessage(message) {
    try {
      // Analyze sentiment
      const sentiment = await this.analyzeMessage(message);
      
      // Generate appropriate response
      const response = await this.generateResponse(message, sentiment);
      
      return {
        success: true,
        response: response
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: 'Failed to process message',
        response: {
          text: "I'm sorry, I'm having trouble understanding right now. Could you try rephrasing?",
          detectedEmotion: 'unknown',
          confidence: 0
        }
      };
    }
  }
}

module.exports = new ChatController(); 