const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    isRead: {
      type: Boolean,
      default: true
    },
    metadata: {
      sentiment: {
        type: String,
        enum: ['positive', 'negative', 'neutral', 'unknown'],
        default: 'unknown'
      },
      topics: [{
        type: String,
        trim: true
      }],
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency', 'none'],
        default: 'none'
      }
    },
    relatedResources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
ChatMessageSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
ChatMessageSchema.index({ 'metadata.urgency': 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 