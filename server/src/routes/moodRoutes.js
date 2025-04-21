const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const moodController = require('../controllers/moodController');

// @route   GET /api/moods
// @desc    Get all moods for a user
// @access  Private
router.get('/', auth, moodController.getMoods);

// @route   GET /api/moods/stats
// @desc    Get mood statistics for a user
// @access  Private
router.get('/stats', auth, moodController.getMoodStats);

// @route   GET /api/moods/:id
// @desc    Get single mood
// @access  Private
router.get('/:id', auth, moodController.getMoodById);

// @route   POST /api/moods
// @desc    Create a mood entry
// @access  Private
router.post('/', [
  auth,
  [
    check('mood', 'Mood is required').not().isEmpty(),
    check('mood', 'Invalid mood value').isIn(['very-low', 'low', 'neutral', 'good', 'excellent']),
    check('intensity', 'Intensity is required').not().isEmpty(),
    check('intensity', 'Intensity must be between 1 and 10').isInt({ min: 1, max: 10 })
  ]
], moodController.createMood);

// @route   PUT /api/moods/:id
// @desc    Update a mood entry
// @access  Private
router.put('/:id', [
  auth,
  [
    check('mood', 'Invalid mood value')
      .optional()
      .isIn(['very-low', 'low', 'neutral', 'good', 'excellent']),
    check('intensity', 'Intensity must be between 1 and 10')
      .optional()
      .isInt({ min: 1, max: 10 })
  ]
], moodController.updateMood);

// @route   DELETE /api/moods/:id
// @desc    Delete a mood entry
// @access  Private
router.delete('/:id', auth, moodController.deleteMood);

module.exports = router; 