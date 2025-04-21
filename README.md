# Mental Health Companion

A comprehensive mental health support application designed to help users track their moods, journal their thoughts, access helpful resources, and chat with an AI companion for emotional support.

## Features

- **User Authentication**: Secure login and registration with JWT authentication
- **Dashboard**: Personalized overview of mood trends, journal entries, and resources
- **Mood Tracker**: Log and visualize mood patterns over time
- **Journal**: Private digital journal with search and analysis features
- **Resources**: Access to mental health articles, videos, and crisis support
- **AI Chat Companion**: Emotionally intelligent conversational support
- **Settings**: Customizable user preferences and account management
- **Speech Recognition**: Voice interaction capabilities for accessibility

## Tech Stack

### Frontend
- React.js with functional components and hooks
- Context API for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js with Express.js
- MongoDB with Mongoose for data storage
- JWT for authentication
- Python Flask API for machine learning features
- TensorFlow for sentiment analysis and recommendations

## Project Structure

```
mental-health-companion/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context for state management
│       ├── pages/          # Page components
│       └── services/       # API services
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── src/                # Core server logic
│   └── app.py              # Python API for ML features
```

## Getting Started

### Prerequisites
- Node.js (v14.x or later)
- MongoDB (local or Atlas)
- Python 3.8+ (for ML features)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mental-health-companion.git
   cd mental-health-companion
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

5. Set up environment variables:
   - Create a `.env` file in the server directory with:
     ```
     NODE_ENV=development
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/mental-health-companion
     JWT_SECRET=your_jwt_secret_key_should_be_long_and_complex
     ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```
   This will start both the Node.js server and the Python Flask API.

2. Start the client:
   ```
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user
- `GET /api/auth/me` - Get current user's data

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update user password
- `PUT /api/users/settings` - Update user settings
- `DELETE /api/users` - Delete user account

### Moods
- `GET /api/moods` - Get all mood entries
- `GET /api/moods/stats` - Get mood statistics
- `POST /api/moods` - Create a new mood entry
- `PUT /api/moods/:id` - Update a mood entry
- `DELETE /api/moods/:id` - Delete a mood entry

### Journals
- `GET /api/journals` - Get all journal entries
- `GET /api/journals/stats` - Get journal statistics
- `GET /api/journals/:id` - Get a specific journal entry
- `POST /api/journals` - Create a new journal entry
- `PUT /api/journals/:id` - Update a journal entry
- `DELETE /api/journals/:id` - Delete a journal entry

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/crisis` - Get crisis resources
- `POST /api/resources` - Add a new resource
- `PUT /api/resources/:id` - Update a resource
- `DELETE /api/resources/:id` - Delete a resource
- `POST /api/resources/:id/toggle-featured` - Toggle featured status

### Chats
- `GET /api/chats` - Get all chat sessions
- `GET /api/chats/:id` - Get a specific chat session
- `POST /api/chats` - Create a new chat session
- `POST /api/chats/:id/messages` - Add a message to a chat
- `PUT /api/chats/:id` - Update chat title
- `DELETE /api/chats/:id` - Delete a chat session

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Mental health resources provided by trusted organizations
- Icons from [react-icons](https://react-icons.github.io/react-icons/)
- UI inspiration from mental health applications 