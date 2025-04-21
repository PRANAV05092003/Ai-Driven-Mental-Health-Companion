const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/resources
 * @desc    Get all resources
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { type, search, featured } = req.query;
    let query = {};

    // Apply type filter if provided
    if (type) {
      query.type = type;
    }

    // Apply search filter if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Apply featured filter if provided
    if (featured === 'true') {
      query.featured = true;
    }

    // Get resources
    const resources = await Resource.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/resources/crisis
 * @desc    Get crisis resources
 * @access  Public
 */
router.get('/crisis', async (req, res) => {
  try {
    // Get crisis resources
    const resources = await Resource.find({ isCrisis: true });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get crisis resources error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/resources
 * @desc    Create a resource
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, url, type, tags, isCrisis, phoneNumber } = req.body;

    // Create resource
    const resource = await Resource.create({
      title,
      description,
      url,
      type,
      tags,
      isCrisis: isCrisis || false,
      phoneNumber,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update a resource
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, url, type, tags, isCrisis, phoneNumber, featured } = req.body;

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (url) updateFields.url = url;
    if (type) updateFields.type = type;
    if (tags) updateFields.tags = tags;
    if (isCrisis !== undefined) updateFields.isCrisis = isCrisis;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (featured !== undefined) updateFields.featured = featured;
    
    updateFields.updatedAt = Date.now();

    // Find and update resource
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find resource
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Delete resource
    await resource.remove();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/resources/:id/toggle-featured
 * @desc    Toggle featured status of a resource
 * @access  Private
 */
router.post('/:id/toggle-featured', protect, async (req, res) => {
  try {
    // Find resource
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Toggle featured status
    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: { featured: !resource.featured, updatedAt: Date.now() } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Resource ${resource.featured ? 'featured' : 'unfeatured'} successfully`,
      resource: {
        id: resource._id,
        featured: resource.featured
      }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router; 