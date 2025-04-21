const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  url: {
    type: String,
    required: [true, 'Please provide a URL'],
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please provide a valid URL'
    ]
  },
  type: {
    type: String,
    required: [true, 'Please provide a resource type'],
    enum: [
      'article',
      'video',
      'podcast',
      'meditation',
      'exercise',
      'tool',
      'app',
      'crisis',
      'other'
    ]
  },
  tags: {
    type: [String],
    default: []
  },
  featured: {
    type: Boolean,
    default: false
  },
  isCrisis: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    match: [
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Please provide a valid phone number'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create text index for search functionality
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Update the updatedAt field on save
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema); 