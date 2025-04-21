# Mental Health Companion - Server

This is the server component of the Mental Health Companion application, providing API endpoints for:
- User authentication and management
- Chat with AI for mental health support
- Mood tracking and analytics
- Journal entries
- Mental health resources

## Architecture

The server uses a hybrid approach with:
- Node.js Express server as the main entry point
- Python Flask API for machine learning and data analysis
- File-based storage (JSON) for simplicity (in a production app, this would be a database)

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)
- npm (Node.js package manager)

## Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/mental-health-companion.git
cd mental-health-companion/server
```

2. Install Node.js dependencies:
```
npm install
```

3. Install Python dependencies:
```
pip install -r requirements.txt
```

4. Create a `.env` file with the following variables:
```
PORT=3000
FLASK_ENV=development
JWT_SECRET=your_secret_key_here
```

## Running the Application

### Development Mode

1. Start the server:
```
npm run dev
```

This will:
- Start the Node.js Express server on port 3000
- Start the Python Flask API on port 5000
- Enable hot reloading for development

### Production Mode

1. Start the server:
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login

### User
- `GET /api/user` - Get user profile
- `PUT /api/user` - Update user profile
- `DELETE /api/user` - Delete user account
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `PUT /api/user/password` - Change user password

### Chat
- `POST /api/chat` - Send message to AI assistant

### Mood Tracking
- `GET /api/moods` - Get user moods
- `GET /api/moods/stats` - Get mood statistics
- `POST /api/moods` - Add a mood entry
- `PUT /api/moods/:id` - Update a mood entry
- `DELETE /api/moods/:id` - Delete a mood entry

### Journal
- `GET /api/journal` - Get journal entries
- `GET /api/journal/stats` - Get journal statistics
- `GET /api/journal/:id` - Get a specific journal entry
- `POST /api/journal` - Add a journal entry
- `PUT /api/journal/:id` - Update a journal entry
- `DELETE /api/journal/:id` - Delete a journal entry

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/crisis` - Get crisis resources
- `POST /api/resources` - Add a resource (admin only)
- `PUT /api/resources/:id` - Update a resource (admin only)
- `DELETE /api/resources/:id` - Delete a resource (admin only)
- `POST /api/resources/:id/toggle-featured` - Toggle featured status (admin only)

## Project Structure

```
server/
├── app.js                  # Node.js entry point
├── app.py                  # Python Flask API
├── data/                   # JSON data storage
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
└── src/
    ├── controllers/        # API controllers
    │   └── chatController.js
    ├── models/             # Data models
    │   ├── journalModel.js
    │   ├── moodModel.js
    │   ├── resourceModel.js
    │   ├── sentimentModel.js
    │   └── userModel.js
    ├── routes/             # API routes
    └── speech/             # Speech processing
```

## Testing

Run the test suite:
```
npm test
```

## License

MIT 