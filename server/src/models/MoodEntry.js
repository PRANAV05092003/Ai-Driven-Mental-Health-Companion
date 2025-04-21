const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mood: {
      type: String,
      required: [true, 'Please select a mood'],
      enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    },
    intensity: {
      type: Number,
      required: [true, 'Please rate the intensity'],
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      default: '',
    },
    activities: [{
      type: String,
      trim: true,
    }],
    triggers: [{
      type: String,
      trim: true,
    }],
    location: {
      type: String,
      default: '',
    },
    weather: {
      type: String,
      default: '',
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    physicalActivity: {
      type: Boolean,
      default: false,
    },
    socialInteraction: {
      type: Boolean,
      default: false,
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    anxietyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user's mood entries within date ranges
MoodEntrySchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('MoodEntry', MoodEntrySchema); 