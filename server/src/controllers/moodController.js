const Mood = require('../models/Mood');
const { validationResult } = require('express-validator');

// @desc    Get all moods for a user
// @route   GET /api/moods
// @access  Private
exports.getMoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add date range filtering if provided
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }
    
    // Add mood filtering if provided
    if (req.query.mood) {
      query.mood = req.query.mood;
    }
    
    // Add tag filtering if provided
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    const moods = await Mood.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Mood.countDocuments(query);
    
    res.json({
      moods,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get mood statistics for a user
// @route   GET /api/moods/stats
// @access  Private
exports.getMoodStats = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'week';
    let startDate;
    const now = new Date();
    
    // Calculate start date based on timeframe
    switch(timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    // Get mood counts by category
    const moodCounts = await Mood.aggregate([
      { $match: { user: req.user.id, createdAt: { $gte: startDate } } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get average intensity over time
    const averageIntensity = await Mood.aggregate([
      { $match: { user: req.user.id, createdAt: { $gte: startDate } } },
      { $group: { 
          _id: { 
            $dateToString: { 
              format: timeframe === 'week' ? "%Y-%m-%d" : 
                      timeframe === 'month' ? "%Y-%m-%d" : "%Y-%m", 
              date: "$createdAt" 
            } 
          },
          avgIntensity: { $avg: "$intensity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get most common tags/triggers
    const commonTags = await Mood.aggregate([
      { $match: { user: req.user.id, createdAt: { $gte: startDate } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const commonTriggers = await Mood.aggregate([
      { $match: { user: req.user.id, createdAt: { $gte: startDate } } },
      { $unwind: "$triggers" },
      { $group: { _id: "$triggers", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      moodCounts,
      averageIntensity,
      commonTags,
      commonTriggers,
      timeframe
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single mood
// @route   GET /api/moods/:id
// @access  Private
exports.getMoodById = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    
    // Check if mood belongs to user
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to access this mood entry' });
    }
    
    res.json(mood);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a mood entry
// @route   POST /api/moods
// @access  Private
exports.createMood = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { mood, intensity, note, tags, triggers, activities } = req.body;
    
    const newMood = new Mood({
      user: req.user.id,
      mood,
      intensity,
      note,
      tags: tags || [],
      triggers: triggers || [],
      activities: activities || []
    });
    
    const savedMood = await newMood.save();
    
    res.json(savedMood);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a mood entry
// @route   PUT /api/moods/:id
// @access  Private
exports.updateMood = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    
    // Check if mood belongs to user
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this mood entry' });
    }
    
    const { mood: moodValue, intensity, note, tags, triggers, activities } = req.body;
    
    // Build update object with only provided fields
    const moodFields = {};
    if (moodValue) moodFields.mood = moodValue;
    if (intensity) moodFields.intensity = intensity;
    if (note !== undefined) moodFields.note = note;
    if (tags) moodFields.tags = tags;
    if (triggers) moodFields.triggers = triggers;
    if (activities) moodFields.activities = activities;
    
    // Update the record
    mood = await Mood.findByIdAndUpdate(
      req.params.id,
      { $set: moodFields },
      { new: true }
    );
    
    res.json(mood);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a mood entry
// @route   DELETE /api/moods/:id
// @access  Private
exports.deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    
    // Check if mood belongs to user
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this mood entry' });
    }
    
    await mood.deleteOne();
    
    res.json({ msg: 'Mood entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mood entry not found' });
    }
    res.status(500).send('Server Error');
  }
}; 