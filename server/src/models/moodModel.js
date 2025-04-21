const fs = require('fs');
const path = require('path');

// Store moods in a JSON file (in a real app, this would be a database)
const dataPath = path.join(__dirname, '../../data');
const moodsFilePath = path.join(dataPath, 'moods.json');

class MoodModel {
  constructor() {
    this.moods = this.loadMoods();
  }

  // Load moods from JSON file
  loadMoods() {
    try {
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      if (!fs.existsSync(moodsFilePath)) {
        fs.writeFileSync(moodsFilePath, JSON.stringify({}));
        return {};
      }

      const data = fs.readFileSync(moodsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading moods:', error);
      return {};
    }
  }

  // Save moods to JSON file
  saveMoods() {
    try {
      fs.writeFileSync(moodsFilePath, JSON.stringify(this.moods, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving moods:', error);
      return false;
    }
  }

  // Add a mood entry for a user
  addMood(userId, moodData) {
    try {
      // Initialize user's moods array if it doesn't exist
      if (!this.moods[userId]) {
        this.moods[userId] = [];
      }

      // Create mood entry
      const moodEntry = {
        id: Date.now().toString(),
        mood: moodData.mood,
        intensity: moodData.intensity || 5, // Default intensity is 5 (1-10 scale)
        notes: moodData.notes || '',
        activities: moodData.activities || [],
        date: moodData.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Add to user's moods array
      this.moods[userId].unshift(moodEntry); // Add to beginning of array
      this.saveMoods();

      return { success: true, message: 'Mood recorded successfully', mood: moodEntry };
    } catch (error) {
      console.error('Error adding mood:', error);
      return { success: false, message: 'Error recording mood' };
    }
  }

  // Get all mood entries for a user
  getUserMoods(userId) {
    try {
      if (!this.moods[userId]) {
        return { success: true, moods: [] };
      }

      return { success: true, moods: this.moods[userId] };
    } catch (error) {
      console.error('Error getting moods:', error);
      return { success: false, message: 'Error retrieving moods' };
    }
  }

  // Get moods within a specific date range
  getUserMoodsByDateRange(userId, startDate, endDate) {
    try {
      if (!this.moods[userId]) {
        return { success: true, moods: [] };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredMoods = this.moods[userId].filter(mood => {
        const moodDate = new Date(mood.date);
        return moodDate >= start && moodDate <= end;
      });

      return { success: true, moods: filteredMoods };
    } catch (error) {
      console.error('Error getting moods by date range:', error);
      return { success: false, message: 'Error retrieving moods' };
    }
  }

  // Get mood stats for a user
  getUserMoodStats(userId) {
    try {
      if (!this.moods[userId] || this.moods[userId].length === 0) {
        return { 
          success: true, 
          stats: {
            moodCounts: {},
            averageIntensity: 0,
            totalEntries: 0,
            mostFrequentMood: null,
            moodTrend: 'stable'
          } 
        };
      }

      // Count occurrences of each mood
      const moodCounts = {};
      let totalIntensity = 0;

      this.moods[userId].forEach(mood => {
        if (!moodCounts[mood.mood]) {
          moodCounts[mood.mood] = 0;
        }
        moodCounts[mood.mood]++;
        totalIntensity += mood.intensity || 5;
      });

      // Find most frequent mood
      let mostFrequentMood = null;
      let maxCount = 0;
      
      Object.keys(moodCounts).forEach(mood => {
        if (moodCounts[mood] > maxCount) {
          mostFrequentMood = mood;
          maxCount = moodCounts[mood];
        }
      });

      // Calculate average intensity
      const averageIntensity = totalIntensity / this.moods[userId].length;

      // Determine mood trend (simple version)
      let moodTrend = 'stable';
      if (this.moods[userId].length >= 5) {
        const recent = this.moods[userId].slice(0, 5);
        const positiveCount = recent.filter(mood => 
          ['happy', 'excited', 'content', 'peaceful', 'joy'].includes(mood.mood.toLowerCase())
        ).length;
        
        const negativeCount = recent.filter(mood => 
          ['sad', 'anxious', 'angry', 'stressed', 'depressed'].includes(mood.mood.toLowerCase())
        ).length;

        if (positiveCount >= 3) {
          moodTrend = 'improving';
        } else if (negativeCount >= 3) {
          moodTrend = 'declining';
        }
      }

      return {
        success: true,
        stats: {
          moodCounts,
          averageIntensity,
          totalEntries: this.moods[userId].length,
          mostFrequentMood,
          moodTrend
        }
      };
    } catch (error) {
      console.error('Error getting mood stats:', error);
      return { success: false, message: 'Error retrieving mood statistics' };
    }
  }

  // Update a mood entry
  updateMood(userId, moodId, moodData) {
    try {
      if (!this.moods[userId]) {
        return { success: false, message: 'User not found' };
      }

      const moodIndex = this.moods[userId].findIndex(mood => mood.id === moodId);
      if (moodIndex === -1) {
        return { success: false, message: 'Mood entry not found' };
      }

      // Update mood data
      this.moods[userId][moodIndex] = {
        ...this.moods[userId][moodIndex],
        ...moodData,
        updatedAt: new Date().toISOString()
      };

      this.saveMoods();

      return { 
        success: true, 
        message: 'Mood updated successfully', 
        mood: this.moods[userId][moodIndex] 
      };
    } catch (error) {
      console.error('Error updating mood:', error);
      return { success: false, message: 'Error updating mood' };
    }
  }

  // Delete a mood entry
  deleteMood(userId, moodId) {
    try {
      if (!this.moods[userId]) {
        return { success: false, message: 'User not found' };
      }

      const moodIndex = this.moods[userId].findIndex(mood => mood.id === moodId);
      if (moodIndex === -1) {
        return { success: false, message: 'Mood entry not found' };
      }

      // Remove mood from array
      this.moods[userId].splice(moodIndex, 1);
      this.saveMoods();

      return { success: true, message: 'Mood entry deleted successfully' };
    } catch (error) {
      console.error('Error deleting mood:', error);
      return { success: false, message: 'Error deleting mood entry' };
    }
  }
}

module.exports = new MoodModel(); 