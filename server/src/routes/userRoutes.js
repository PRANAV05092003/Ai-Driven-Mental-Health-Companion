const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, userController.updateUserProfile);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', authMiddleware, userController.updatePassword);

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', authMiddleware, userController.updateSettings);

// @route   GET /api/users/settings
// @desc    Get user settings
// @access  Private
router.get('/settings', authMiddleware, userController.getSettings);

// @route   DELETE /api/users
// @desc    Delete user account
// @access  Private
router.delete('/', authMiddleware, userController.deleteAccount);

// @route   POST /api/users/export
// @desc    Export user data
// @access  Private
router.post('/export', authMiddleware, userController.exportUserData);

// @route   POST /api/users/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email/:token', userController.verifyEmail);

// @route   POST /api/users/reset-password
// @desc    Request password reset
// @access  Public
router.post('/reset-password', userController.requestPasswordReset);

// @route   POST /api/users/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router; 