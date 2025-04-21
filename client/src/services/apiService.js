import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add a request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // ===== User & Auth Services =====
  
  async login(email, password) {
    return this.api.post('/auth/login', { email, password });
  }

  async register(userData) {
    return this.api.post('/auth/register', userData);
  }

  async getCurrentUser() {
    return this.api.get('/auth/me');
  }

  async updateProfile(userData) {
    return this.api.put('/users/profile', userData);
  }

  async updatePassword(passwordData) {
    return this.api.put('/users/password', passwordData);
  }

  async updateSettings(settingsData) {
    return this.api.put('/users/settings', settingsData);
  }

  async deleteAccount() {
    return this.api.delete('/users');
  }

  // ===== Mood Tracking Services =====
  
  async getMoods(params = {}) {
    return this.api.get('/moods', { params });
  }

  async getMoodStats() {
    return this.api.get('/moods/stats');
  }

  async addMood(moodData) {
    return this.api.post('/moods', moodData);
  }

  async updateMood(moodId, moodData) {
    return this.api.put(`/moods/${moodId}`, moodData);
  }

  async deleteMood(moodId) {
    return this.api.delete(`/moods/${moodId}`);
  }

  // ===== Journal Services =====
  
  async getJournalEntries(params = {}) {
    return this.api.get('/journals', { params });
  }

  async getJournalStats() {
    return this.api.get('/journals/stats');
  }

  async getJournalEntry(entryId) {
    return this.api.get(`/journals/${entryId}`);
  }

  async addJournalEntry(entryData) {
    return this.api.post('/journals', entryData);
  }

  async updateJournalEntry(entryId, entryData) {
    return this.api.put(`/journals/${entryId}`, entryData);
  }

  async deleteJournalEntry(entryId) {
    return this.api.delete(`/journals/${entryId}`);
  }

  // ===== Resource Services =====
  
  async getResources(params = {}) {
    return this.api.get('/resources', { params });
  }

  async getCrisisResources() {
    return this.api.get('/resources/crisis');
  }

  async addResource(resourceData) {
    return this.api.post('/resources', resourceData);
  }

  async updateResource(resourceId, resourceData) {
    return this.api.put(`/resources/${resourceId}`, resourceData);
  }

  async deleteResource(resourceId) {
    return this.api.delete(`/resources/${resourceId}`);
  }

  async toggleResourceFeatured(resourceId) {
    return this.api.post(`/resources/${resourceId}/toggle-featured`);
  }

  // ===== Chat Services =====
  
  async getChats() {
    return this.api.get('/chats');
  }

  async getChat(chatId) {
    return this.api.get(`/chats/${chatId}`);
  }

  async createChat(chatData = {}) {
    return this.api.post('/chats', chatData);
  }

  async addMessage(chatId, messageData) {
    return this.api.post(`/chats/${chatId}/messages`, messageData);
  }

  async updateChatTitle(chatId, title) {
    return this.api.put(`/chats/${chatId}`, { title });
  }

  async deleteChat(chatId) {
    return this.api.delete(`/chats/${chatId}`);
  }

  // ===== ML API Services =====
  
  async analyzeText(text) {
    return this.api.post('/ml/analyze', { text });
  }

  async getRecommendations(userData) {
    return this.api.post('/ml/recommendations', userData);
  }

  async getSummary(userId, params = {}) {
    return this.api.get(`/ml/summary/${userId}`, { params });
  }
}

export default new ApiService(); 