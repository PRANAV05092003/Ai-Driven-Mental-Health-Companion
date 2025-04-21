const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  tags: {
    type: [String],
    default: []
  },
  mood: {
    type: String,
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
      'Confused',
      'Neutral'
    ],
    default: 'Neutral'
  },
  date: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  wordCount: {
    type: Number,
    default: function() {
      return this.content ? this.content.split(/\s+/).length : 0;
    }
  }
});

// Create text index for search functionality
JournalSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Create index for user and date for faster queries
JournalSchema.index({ user: 1, date: -1 });

// Pre-save hook to update wordCount
JournalSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

module.exports = mongoose.model('Journal', JournalSchema); 