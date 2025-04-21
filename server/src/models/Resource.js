const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['article', 'video', 'podcast', 'exercise', 'meditation', 'crisis', 'community', 'tool'],
      index: true
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: '/default-resource.jpg'
    },
    author: {
      type: String,
      trim: true
    },
    publishedDate: {
      type: Date
    },
    duration: {
      type: Number,
      min: 0,
      description: 'Duration in minutes'
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isCrisis: {
      type: Boolean,
      default: false,
      index: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
      index: true
    },
    contentSummary: {
      type: String,
      trim: true
    },
    relatedTopics: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text', relatedTopics: 'text' });
ResourceSchema.index({ category: 1, isFeatured: 1 });
ResourceSchema.index({ category: 1, status: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', ResourceSchema); 