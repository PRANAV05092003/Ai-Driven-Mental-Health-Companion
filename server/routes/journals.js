const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/journals
 * @desc    Get all journal entries for a user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = { user: req.user.id };

    // Apply date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Apply search filter if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Get journals
    const journals = await Journal.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: journals.length,
      entries: journals
    });
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/journals/stats
 * @desc    Get journal statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Get total number of entries
    const totalEntries = await Journal.countDocuments({ user: req.user.id });

    // Get average word count
    const entriesWithWordCount = await Journal.find({ user: req.user.id }).select('wordCount');
    const totalWords = entriesWithWordCount.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const averageLength = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Get most frequent mood
    const moodAggregation = await Journal.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostFrequentMood = moodAggregation.length > 0 ? moodAggregation[0]._id : null;

    // Get monthly activity
    const monthlyActivity = await Journal.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Format monthly activity
    const formattedMonthlyActivity = {};
    monthlyActivity.forEach(item => {
      const monthStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      formattedMonthlyActivity[monthStr] = item.count;
    });

    // Get word frequency (simplified version)
    const wordFrequency = {};
    // In a real implementation, this would be calculated using natural language processing
    // or a database aggregation that splits text into words

    res.status(200).json({
      success: true,
      stats: {
        totalEntries,
        averageLength,
        mostFrequentMood,
        monthlyActivity: formattedMonthlyActivity,
        wordFrequency
      }
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/journals/:id
 * @desc    Get single journal entry
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      entry: journal
    });
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/journals
 * @desc    Create a journal entry
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, date, tags, mood } = req.body;

    // Create journal
    const journal = await Journal.create({
      title,
      content,
      user: req.user.id,
      date: date ? new Date(date) : Date.now(),
      tags,
      mood
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      entry: journal
    });
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/journals/:id
 * @desc    Update a journal entry
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content, date, tags, mood } = req.body;

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (date) updateFields.date = new Date(date);
    if (tags) updateFields.tags = tags;
    if (mood) updateFields.mood = mood;

    // Find and update journal
    let journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    journal = await Journal.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      entry: journal
    });
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/journals/:id
 * @desc    Delete a journal entry
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find journal
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Delete journal
    await journal.remove();

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router; 