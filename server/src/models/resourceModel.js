const fs = require('fs');
const path = require('path');

// Store resources in a JSON file (in a real app, this would be a database)
const dataPath = path.join(__dirname, '../../data');
const resourcesFilePath = path.join(dataPath, 'resources.json');

// Default resources to populate initially
const defaultResources = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    description: 'Learn about the causes and symptoms of anxiety disorders.',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    type: 'article',
    tags: ['anxiety', 'education', 'mental health'],
    featured: true
  },
  {
    id: '2',
    title: '10-Minute Meditation for Beginners',
    description: 'A guided meditation for beginners to reduce stress and anxiety.',
    url: 'https://www.mindful.org/how-to-meditate/',
    type: 'meditation',
    tags: ['meditation', 'stress relief', 'beginner'],
    featured: true
  },
  {
    id: '3',
    title: 'Deep Breathing Exercises',
    description: 'Simple breathing techniques to help manage stress and anxiety.',
    url: 'https://www.health.harvard.edu/blog/ease-anxiety-and-stress-take-a-deep-breath-2019042616030',
    type: 'exercise',
    tags: ['breathing', 'anxiety', 'stress relief'],
    featured: false
  },
  {
    id: '4',
    title: 'The Science of Well-Being',
    description: 'Free online course about the science of happiness and well-being.',
    url: 'https://www.coursera.org/learn/the-science-of-well-being',
    type: 'course',
    tags: ['education', 'wellbeing', 'happiness'],
    featured: true
  },
  {
    id: '5',
    title: 'National Suicide Prevention Lifeline',
    description: 'Free and confidential support for people in distress.',
    url: 'https://suicidepreventionlifeline.org/',
    phone: '1-800-273-8255',
    type: 'crisis',
    tags: ['crisis', 'emergency', 'suicide prevention'],
    featured: true
  },
  {
    id: '6',
    title: 'The Mental Health Podcast',
    description: 'Discussions about mental health topics and personal stories.',
    url: 'https://www.mentalhealthpodcast.com/',
    type: 'podcast',
    tags: ['podcast', 'stories', 'education'],
    featured: false
  },
  {
    id: '7',
    title: 'Progressive Muscle Relaxation',
    description: 'Learn how to release tension through progressive muscle relaxation.',
    url: 'https://www.verywellmind.com/how-do-i-practice-progressive-muscle-relaxation-3024400',
    type: 'exercise',
    tags: ['relaxation', 'stress relief', 'physical'],
    featured: false
  },
  {
    id: '8',
    title: 'Cognitive Behavioral Therapy Basics',
    description: 'Introduction to CBT techniques for managing negative thought patterns.',
    url: 'https://www.psychologytoday.com/us/basics/cognitive-behavioral-therapy',
    type: 'article',
    tags: ['cbt', 'therapy', 'education'],
    featured: true
  },
  {
    id: '9',
    title: 'Crisis Text Line',
    description: 'Free 24/7 text support for those in crisis.',
    url: 'https://www.crisistextline.org/',
    phone: 'Text HOME to 741741',
    type: 'crisis',
    tags: ['crisis', 'emergency', 'text support'],
    featured: true
  },
  {
    id: '10',
    title: 'Sleep Hygiene Tips',
    description: 'Practical advice for improving sleep quality and duration.',
    url: 'https://www.sleepfoundation.org/articles/sleep-hygiene',
    type: 'article',
    tags: ['sleep', 'health', 'habits'],
    featured: false
  }
];

class ResourceModel {
  constructor() {
    this.resources = this.loadResources();
  }

  // Load resources from JSON file
  loadResources() {
    try {
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      if (!fs.existsSync(resourcesFilePath)) {
        // Initialize with default resources
        fs.writeFileSync(resourcesFilePath, JSON.stringify(defaultResources, null, 2));
        return defaultResources;
      }

      const data = fs.readFileSync(resourcesFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      return defaultResources;
    }
  }

  // Save resources to JSON file
  saveResources() {
    try {
      fs.writeFileSync(resourcesFilePath, JSON.stringify(this.resources, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving resources:', error);
      return false;
    }
  }

  // Get all resources
  getAllResources() {
    try {
      return { success: true, resources: this.resources };
    } catch (error) {
      console.error('Error getting resources:', error);
      return { success: false, message: 'Error retrieving resources' };
    }
  }

  // Get resources by type
  getResourcesByType(type) {
    try {
      const filteredResources = this.resources.filter(resource => resource.type === type);
      return { success: true, resources: filteredResources };
    } catch (error) {
      console.error('Error getting resources by type:', error);
      return { success: false, message: 'Error retrieving resources' };
    }
  }

  // Get featured resources
  getFeaturedResources() {
    try {
      const featuredResources = this.resources.filter(resource => resource.featured);
      return { success: true, resources: featuredResources };
    } catch (error) {
      console.error('Error getting featured resources:', error);
      return { success: false, message: 'Error retrieving featured resources' };
    }
  }

  // Get crisis resources
  getCrisisResources() {
    try {
      const crisisResources = this.resources.filter(resource => resource.type === 'crisis');
      return { success: true, resources: crisisResources };
    } catch (error) {
      console.error('Error getting crisis resources:', error);
      return { success: false, message: 'Error retrieving crisis resources' };
    }
  }

  // Search resources
  searchResources(searchTerm) {
    try {
      const term = searchTerm.toLowerCase();
      const results = this.resources.filter(resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.description.toLowerCase().includes(term) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(term)))
      );

      return { success: true, resources: results };
    } catch (error) {
      console.error('Error searching resources:', error);
      return { success: false, message: 'Error searching resources' };
    }
  }

  // Add a new resource
  addResource(resourceData) {
    try {
      // Create resource object
      const newResource = {
        id: Date.now().toString(),
        title: resourceData.title,
        description: resourceData.description,
        url: resourceData.url,
        type: resourceData.type,
        tags: resourceData.tags || [],
        featured: resourceData.featured || false,
        createdAt: new Date().toISOString()
      };

      // Add phone number if it's a crisis resource
      if (resourceData.type === 'crisis' && resourceData.phone) {
        newResource.phone = resourceData.phone;
      }

      // Add to resources array
      this.resources.push(newResource);
      this.saveResources();

      return { success: true, message: 'Resource added successfully', resource: newResource };
    } catch (error) {
      console.error('Error adding resource:', error);
      return { success: false, message: 'Error adding resource' };
    }
  }

  // Update a resource
  updateResource(resourceId, resourceData) {
    try {
      const resourceIndex = this.resources.findIndex(resource => resource.id === resourceId);
      if (resourceIndex === -1) {
        return { success: false, message: 'Resource not found' };
      }

      // Update resource data
      this.resources[resourceIndex] = {
        ...this.resources[resourceIndex],
        ...resourceData,
        updatedAt: new Date().toISOString()
      };

      this.saveResources();

      return { 
        success: true, 
        message: 'Resource updated successfully', 
        resource: this.resources[resourceIndex] 
      };
    } catch (error) {
      console.error('Error updating resource:', error);
      return { success: false, message: 'Error updating resource' };
    }
  }

  // Delete a resource
  deleteResource(resourceId) {
    try {
      const resourceIndex = this.resources.findIndex(resource => resource.id === resourceId);
      if (resourceIndex === -1) {
        return { success: false, message: 'Resource not found' };
      }

      // Remove resource from array
      this.resources.splice(resourceIndex, 1);
      this.saveResources();

      return { success: true, message: 'Resource deleted successfully' };
    } catch (error) {
      console.error('Error deleting resource:', error);
      return { success: false, message: 'Error deleting resource' };
    }
  }

  // Toggle featured status of a resource
  toggleFeatured(resourceId) {
    try {
      const resourceIndex = this.resources.findIndex(resource => resource.id === resourceId);
      if (resourceIndex === -1) {
        return { success: false, message: 'Resource not found' };
      }

      // Toggle featured status
      this.resources[resourceIndex].featured = !this.resources[resourceIndex].featured;
      this.saveResources();

      return { 
        success: true, 
        message: `Resource ${this.resources[resourceIndex].featured ? 'featured' : 'unfeatured'} successfully`, 
        resource: this.resources[resourceIndex] 
      };
    } catch (error) {
      console.error('Error toggling resource featured status:', error);
      return { success: false, message: 'Error updating resource' };
    }
  }
}

module.exports = new ResourceModel(); 