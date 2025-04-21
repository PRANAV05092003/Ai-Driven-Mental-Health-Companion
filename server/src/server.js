const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const moodRoutes = require('./routes/moodRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const chatRoutes = require('./routes/chatRoutes');
const journalRoutes = require('./routes/journalRoutes');
const apiRoutes = require('./routes/api');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '../../client/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assistant', aiAssistantRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api', apiRoutes);

// Default route
// Catch-all route to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server
});

module.exports = { app, server }; 