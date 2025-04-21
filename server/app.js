const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Start Python Flask API
let pythonProcess = null;

function startPythonAPI() {
  console.log('Starting Python API...');
  
  // Command to start the Python API
  const command = process.platform === 'win32' 
    ? 'python app.py' 
    : 'python3 app.py';
  
  pythonProcess = exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Python API: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Python API stderr: ${stderr}`);
      return;
    }
    console.log(`Python API stdout: ${stdout}`);
  });
  
  pythonProcess.on('exit', (code) => {
    console.log(`Python API process exited with code ${code}`);
    // Restart Python API if it crashes
    if (code !== 0 && code !== null) {
      console.log('Restarting Python API...');
      setTimeout(startPythonAPI, 5000);
    }
  });
}

// Import route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const moods = require('./routes/moods');
const journals = require('./routes/journals');
const resources = require('./routes/resources');
const chats = require('./routes/chats');

// Mount routes
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/moods', moods);
app.use('/api/journals', journals);
app.use('/api/resources', resources);
app.use('/api/chats', chats);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    databaseConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Proxy requests to Python API for ML features
app.use('/api/ml', (req, res) => {
  // Redirect to Python API
  res.redirect(307, `http://localhost:5000${req.originalUrl}`);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startPythonAPI();
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Received shutdown signal');
  
  // Kill Python API process
  if (pythonProcess) {
    console.log('Stopping Python API...');
    pythonProcess.kill();
  }
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
} 