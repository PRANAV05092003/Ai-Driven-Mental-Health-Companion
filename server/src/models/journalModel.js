const fs = require('fs');
const path = require('path');

// Store journal entries in a JSON file (in a real app, this would be a database)
const dataPath = path.join(__dirname, '../../data');
const journalFilePath = path.join(dataPath, 'journal.json');

class JournalModel {
  constructor() {
    this.entries = this.loadEntries();
  }

  // Load journal entries from JSON file
  loadEntries() {
    try {
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      if (!fs.existsSync(journalFilePath)) {
        fs.writeFileSync(journalFilePath, JSON.stringify({}));
        return {};
      }

      const data = fs.readFileSync(journalFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return {};
    }
  }

  // Save journal entries to JSON file
  saveEntries() {
    try {
      fs.writeFileSync(journalFilePath, JSON.stringify(this.entries, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving journal entries:', error);
      return false;
    }
  }

  // Add a journal entry for a user
  addEntry(userId, entryData) {
    try {
      // Initialize user's entries array if it doesn't exist
      if (!this.entries[userId]) {
        this.entries[userId] = [];
      }

      // Create journal entry
      const entry = {
        id: Date.now().toString(),
        title: entryData.title || 'Untitled Entry',
        content: entryData.content || '',
        mood: entryData.mood || '',
        tags: entryData.tags || [],
        date: entryData.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Add to user's entries array
      this.entries[userId].unshift(entry); // Add to beginning of array
      this.saveEntries();

      return { success: true, message: 'Journal entry created successfully', entry };
    } catch (error) {
      console.error('Error adding journal entry:', error);
      return { success: false, message: 'Error creating journal entry' };
    }
  }

  // Get all journal entries for a user
  getUserEntries(userId) {
    try {
      if (!this.entries[userId]) {
        return { success: true, entries: [] };
      }

      return { success: true, entries: this.entries[userId] };
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return { success: false, message: 'Error retrieving journal entries' };
    }
  }

  // Get a specific journal entry
  getEntry(userId, entryId) {
    try {
      if (!this.entries[userId]) {
        return { success: false, message: 'No entries found for this user' };
      }

      const entry = this.entries[userId].find(entry => entry.id === entryId);
      if (!entry) {
        return { success: false, message: 'Journal entry not found' };
      }

      return { success: true, entry };
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return { success: false, message: 'Error retrieving journal entry' };
    }
  }

  // Get journal entries by date range
  getUserEntriesByDateRange(userId, startDate, endDate) {
    try {
      if (!this.entries[userId]) {
        return { success: true, entries: [] };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredEntries = this.entries[userId].filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });

      return { success: true, entries: filteredEntries };
    } catch (error) {
      console.error('Error getting entries by date range:', error);
      return { success: false, message: 'Error retrieving journal entries' };
    }
  }

  // Search journal entries by content or title
  searchEntries(userId, searchTerm) {
    try {
      if (!this.entries[userId]) {
        return { success: true, entries: [] };
      }

      const term = searchTerm.toLowerCase();
      const results = this.entries[userId].filter(entry => 
        entry.title.toLowerCase().includes(term) || 
        entry.content.toLowerCase().includes(term) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(term)))
      );

      return { success: true, entries: results };
    } catch (error) {
      console.error('Error searching journal entries:', error);
      return { success: false, message: 'Error searching journal entries' };
    }
  }

  // Update a journal entry
  updateEntry(userId, entryId, entryData) {
    try {
      if (!this.entries[userId]) {
        return { success: false, message: 'User not found' };
      }

      const entryIndex = this.entries[userId].findIndex(entry => entry.id === entryId);
      if (entryIndex === -1) {
        return { success: false, message: 'Journal entry not found' };
      }

      // Update entry data
      this.entries[userId][entryIndex] = {
        ...this.entries[userId][entryIndex],
        ...entryData,
        updatedAt: new Date().toISOString()
      };

      this.saveEntries();

      return { 
        success: true, 
        message: 'Journal entry updated successfully', 
        entry: this.entries[userId][entryIndex] 
      };
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return { success: false, message: 'Error updating journal entry' };
    }
  }

  // Delete a journal entry
  deleteEntry(userId, entryId) {
    try {
      if (!this.entries[userId]) {
        return { success: false, message: 'User not found' };
      }

      const entryIndex = this.entries[userId].findIndex(entry => entry.id === entryId);
      if (entryIndex === -1) {
        return { success: false, message: 'Journal entry not found' };
      }

      // Remove entry from array
      this.entries[userId].splice(entryIndex, 1);
      this.saveEntries();

      return { success: true, message: 'Journal entry deleted successfully' };
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return { success: false, message: 'Error deleting journal entry' };
    }
  }

  // Get journal statistics for a user
  getUserJournalStats(userId) {
    try {
      if (!this.entries[userId] || this.entries[userId].length === 0) {
        return { 
          success: true, 
          stats: {
            totalEntries: 0,
            averageLength: 0,
            mostFrequentMood: null,
            monthlyActivity: {},
            wordFrequency: {}
          } 
        };
      }

      // Total entries
      const totalEntries = this.entries[userId].length;

      // Average content length
      const totalLength = this.entries[userId].reduce((acc, entry) => acc + entry.content.length, 0);
      const averageLength = Math.round(totalLength / totalEntries);

      // Most frequent mood
      const moodCounts = {};
      this.entries[userId].forEach(entry => {
        if (entry.mood && entry.mood !== '') {
          if (!moodCounts[entry.mood]) {
            moodCounts[entry.mood] = 0;
          }
          moodCounts[entry.mood]++;
        }
      });

      let mostFrequentMood = null;
      let maxCount = 0;
      
      Object.keys(moodCounts).forEach(mood => {
        if (moodCounts[mood] > maxCount) {
          mostFrequentMood = mood;
          maxCount = moodCounts[mood];
        }
      });

      // Monthly activity
      const monthlyActivity = {};
      this.entries[userId].forEach(entry => {
        const date = new Date(entry.date);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyActivity[month]) {
          monthlyActivity[month] = 0;
        }
        monthlyActivity[month]++;
      });

      // Word frequency (simple version)
      const wordFrequency = {};
      const commonWords = ['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'was', 'with', 'for', 'on', 'as', 'are'];
      
      this.entries[userId].forEach(entry => {
        const words = entry.content.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 2 && !commonWords.includes(word));
        
        words.forEach(word => {
          if (!wordFrequency[word]) {
            wordFrequency[word] = 0;
          }
          wordFrequency[word]++;
        });
      });

      // Sort and get top words
      const topWords = {};
      Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([word, count]) => {
          topWords[word] = count;
        });

      return {
        success: true,
        stats: {
          totalEntries,
          averageLength,
          mostFrequentMood,
          monthlyActivity,
          wordFrequency: topWords
        }
      };
    } catch (error) {
      console.error('Error getting journal stats:', error);
      return { success: false, message: 'Error retrieving journal statistics' };
    }
  }
}

module.exports = new JournalModel(); 