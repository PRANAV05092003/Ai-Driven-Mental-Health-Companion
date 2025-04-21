const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'excited', 'grateful', 'relaxed', 'content', 'tired', 'bored', 'sad', 'angry', 'stressed', 'anxious']
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  factors: [{
    type: String,
    enum: ['work', 'family', 'friends', 'health', 'sleep', 'exercise', 'nutrition', 'weather', 'finances', 'other']
  }],
  activities: [{
    type: String
  }],
  notes: {
    type: String,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
MoodSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Mood', MoodSchema); 