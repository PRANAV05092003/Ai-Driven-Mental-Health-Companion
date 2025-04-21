const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/moods
 * @desc    Get all mood entries for a user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.user.id };

    // Apply date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get moods
    const moods = await Mood.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: moods.length,
      moods
    });
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/moods/stats
 * @desc    Get mood statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Get mood counts
    const moodCounts = await Mood.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format mood counts
    const formattedMoodCounts = {};
    moodCounts.forEach(item => {
      formattedMoodCounts[item._id] = item.count;
    });

    // Get total entries
    const totalEntries = moodCounts.reduce((sum, item) => sum + item.count, 0);

    // Get average intensity
    const intensityResult = await Mood.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, average: { $avg: '$intensity' } } }
    ]);
    const averageIntensity = intensityResult.length > 0 
      ? parseFloat(intensityResult[0].average.toFixed(1)) 
      : 0;

    // Get most frequent mood
    const mostFrequentMood = moodCounts.length > 0 ? moodCounts[0]._id : null;

    // Determine mood trend (simplified)
    // In a real implementation, this would be more sophisticated
    const moodTrend = 'stable';

    res.status(200).json({
      success: true,
      stats: {
        moodCounts: formattedMoodCounts,
        averageIntensity,
        totalEntries,
        mostFrequentMood,
        moodTrend
      }
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/moods
 * @desc    Create a mood entry
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { mood, intensity, notes, factors, activities, location, date } = req.body;

    // Create mood
    const moodEntry = await Mood.create({
      mood,
      intensity: intensity || 5,
      notes,
      factors,
      activities,
      location,
      date: date ? new Date(date) : Date.now(),
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Mood recorded successfully',
      mood: moodEntry
    });
  } catch (error) {
    console.error('Create mood error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/moods/:id
 * @desc    Update a mood entry
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { mood, intensity, notes, factors, activities, location, date } = req.body;

    // Build update object
    const updateFields = {};
    if (mood) updateFields.mood = mood;
    if (intensity) updateFields.intensity = intensity;
    if (notes !== undefined) updateFields.notes = notes;
    if (factors) updateFields.factors = factors;
    if (activities) updateFields.activities = activities;
    if (location) updateFields.location = location;
    if (date) updateFields.date = new Date(date);

    // Find and update mood
    let moodEntry = await Mood.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    moodEntry = await Mood.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Mood updated successfully',
      mood: moodEntry
    });
  } catch (error) {
    console.error('Update mood error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/moods/:id
 * @desc    Delete a mood entry
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find mood
    const mood = await Mood.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Delete mood
    await mood.remove();

    res.status(200).json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete mood error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router; 