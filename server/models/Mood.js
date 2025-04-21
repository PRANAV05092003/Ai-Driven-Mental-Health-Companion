const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: [true, 'Please provide a mood'],
    enum: [
      'Happy',
      'Sad',
      'Angry',
      'Anxious',
      'Calm',
      'Energetic',
      'Tired',
      'Stressed',
      'Excited',
      'Content',
      'Bored',
      'Hopeful',
      'Overwhelmed',
      'Grateful',
      'Frustrated',
      'Confused'
    ]
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  factors: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String
  },
  activities: {
    type: [String],
    default: []
  }
});

// Create index for user and date for faster queries
MoodSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Mood', MoodSchema); 