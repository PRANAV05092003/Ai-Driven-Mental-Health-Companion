import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
from functools import wraps

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Create a mock controller for demonstration
class MockChatController:
    def processMessage(self, message):
        return {
            'success': True,
            'response': {
                'text': f"This is a mock response to: '{message}'",
                'detectedEmotion': 'neutral',
                'confidence': 0.8
            }
        }

# Create mock models
class MockUserModel:
    def createUser(self, data):
        return {
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': 'mock-id',
                'name': data.get('name', ''),
                'email': data.get('email', '')
            }
        }
    
    def authenticateUser(self, email, password):
        return {
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': 'mock-id',
                'name': 'Test User',
                'email': email
            },
            'token': 'mock-token'
        }
    
    def getUserById(self, userId):
        return {
            'id': userId,
            'name': 'Test User',
            'email': 'test@example.com',
            'settings': {
                'notifications': {
                    'email': True,
                    'push': True,
                    'reminders': True
                },
                'privacy': {
                    'dataSharing': False,
                    'anonymousAnalytics': True
                }
            }
        }
    
    def updateUser(self, userId, data):
        return {
            'success': True,
            'message': 'User updated successfully',
            'user': {
                'id': userId,
                'name': data.get('name', 'Test User'),
                'email': data.get('email', 'test@example.com')
            }
        }
    
    def changePassword(self, userId, currentPassword, newPassword):
        return {
            'success': True,
            'message': 'Password changed successfully'
        }
    
    def deleteUser(self, userId):
        return {
            'success': True,
            'message': 'Account deleted successfully'
        }
    
    def updateUserSettings(self, userId, settings):
        return {
            'success': True,
            'message': 'Settings updated successfully',
            'settings': settings
        }

class MockMoodModel:
    def getUserMoods(self, userId):
        return {
            'success': True,
            'moods': [
                {
                    'id': '1',
                    'mood': 'Happy',
                    'notes': 'Had a great day!',
                    'date': '2023-05-15T10:30:00'
                },
                {
                    'id': '2',
                    'mood': 'Anxious',
                    'notes': 'Feeling stressed about work',
                    'date': '2023-05-14T18:45:00'
                },
                {
                    'id': '3',
                    'mood': 'Calm',
                    'notes': 'Meditation helped today',
                    'date': '2023-05-13T08:20:00'
                }
            ]
        }
    
    def getUserMoodsByDateRange(self, userId, startDate, endDate):
        return self.getUserMoods(userId)
    
    def getUserMoodStats(self, userId):
        return {
            'success': True,
            'stats': {
                'moodCounts': {
                    'Happy': 2,
                    'Anxious': 1,
                    'Calm': 1
                },
                'averageIntensity': 6.5,
                'totalEntries': 4,
                'mostFrequentMood': 'Happy',
                'moodTrend': 'improving'
            }
        }
    
    def addMood(self, userId, moodData):
        return {
            'success': True,
            'message': 'Mood recorded successfully',
            'mood': {
                'id': '4',
                'mood': moodData.get('mood', ''),
                'notes': moodData.get('notes', ''),
                'date': moodData.get('date', '')
            }
        }
    
    def updateMood(self, userId, moodId, moodData):
        return {
            'success': True,
            'message': 'Mood updated successfully',
            'mood': {
                'id': moodId,
                'mood': moodData.get('mood', ''),
                'notes': moodData.get('notes', ''),
                'date': moodData.get('date', '')
            }
        }
    
    def deleteMood(self, userId, moodId):
        return {
            'success': True,
            'message': 'Mood entry deleted successfully'
        }

class MockJournalModel:
    def getUserEntries(self, userId):
        return {
            'success': True,
            'entries': [
                {
                    'id': '1',
                    'title': 'First day of therapy',
                    'content': 'Had my first therapy session today. It went really well...',
                    'date': '2023-05-10T14:30:00'
                },
                {
                    'id': '2',
                    'title': 'Trying meditation',
                    'content': 'Started a daily meditation practice today...',
                    'date': '2023-05-12T20:15:00'
                }
            ]
        }
    
    def searchEntries(self, userId, searchTerm):
        return self.getUserEntries(userId)
    
    def getUserEntriesByDateRange(self, userId, startDate, endDate):
        return self.getUserEntries(userId)
    
    def getEntry(self, userId, entryId):
        return {
            'success': True,
            'entry': {
                'id': entryId,
                'title': 'Sample Journal Entry',
                'content': 'This is a sample journal entry content...',
                'date': '2023-05-10T14:30:00'
            }
        }
    
    def getUserJournalStats(self, userId):
        return {
            'success': True,
            'stats': {
                'totalEntries': 10,
                'averageLength': 250,
                'mostFrequentMood': 'Happy',
                'monthlyActivity': {
                    '2023-05': 5,
                    '2023-04': 3,
                    '2023-03': 2
                },
                'wordFrequency': {
                    'meditation': 15,
                    'therapy': 10,
                    'exercise': 8
                }
            }
        }
    
    def addEntry(self, userId, entryData):
        return {
            'success': True,
            'message': 'Journal entry created successfully',
            'entry': {
                'id': '3',
                'title': entryData.get('title', ''),
                'content': entryData.get('content', ''),
                'date': entryData.get('date', '')
            }
        }
    
    def updateEntry(self, userId, entryId, entryData):
        return {
            'success': True,
            'message': 'Journal entry updated successfully',
            'entry': {
                'id': entryId,
                'title': entryData.get('title', ''),
                'content': entryData.get('content', ''),
                'date': entryData.get('date', '')
            }
        }
    
    def deleteEntry(self, userId, entryId):
        return {
            'success': True,
            'message': 'Journal entry deleted successfully'
        }

class MockResourceModel:
    def getAllResources(self):
        return {
            'success': True,
            'resources': [
                {
                    'id': '1',
                    'title': 'Understanding Anxiety',
                    'description': 'Learn about the causes and symptoms of anxiety disorders.',
                    'url': 'https://example.com/anxiety',
                    'type': 'article'
                },
                {
                    'id': '2',
                    'title': '10-Minute Meditation',
                    'description': 'A guided meditation for beginners.',
                    'url': 'https://example.com/meditation',
                    'type': 'meditation'
                },
                {
                    'id': '3',
                    'title': 'Stress Relief Techniques',
                    'description': 'Simple exercises to reduce stress.',
                    'url': 'https://example.com/stress-relief',
                    'type': 'exercise'
                }
            ]
        }
    
    def getResourcesByType(self, type):
        resources = self.getAllResources()
        filtered = [r for r in resources['resources'] if r['type'] == type]
        return {'success': True, 'resources': filtered}
    
    def getFeaturedResources(self):
        return self.getAllResources()
    
    def getCrisisResources(self):
        return {
            'success': True,
            'resources': [
                {
                    'id': '5',
                    'title': 'Crisis Hotline',
                    'description': '24/7 support for mental health crises',
                    'url': 'https://example.com/crisis',
                    'type': 'crisis',
                    'phone': '1-800-273-8255'
                }
            ]
        }
    
    def searchResources(self, searchTerm):
        return self.getAllResources()
    
    def addResource(self, resourceData):
        return {
            'success': True,
            'message': 'Resource added successfully',
            'resource': {
                'id': '4',
                'title': resourceData.get('title', ''),
                'description': resourceData.get('description', ''),
                'url': resourceData.get('url', ''),
                'type': resourceData.get('type', '')
            }
        }
    
    def updateResource(self, resourceId, resourceData):
        return {
            'success': True,
            'message': 'Resource updated successfully',
            'resource': {
                'id': resourceId,
                'title': resourceData.get('title', ''),
                'description': resourceData.get('description', ''),
                'url': resourceData.get('url', ''),
                'type': resourceData.get('type', '')
            }
        }
    
    def deleteResource(self, resourceId):
        return {
            'success': True,
            'message': 'Resource deleted successfully'
        }
    
    def toggleFeatured(self, resourceId):
        return {
            'success': True,
            'message': 'Resource featured successfully',
            'resource': {
                'id': resourceId,
                'featured': True
            }
        }

# Initialize mock controllers and models
chatController = MockChatController()
userModel = MockUserModel()
moodModel = MockMoodModel()
journalModel = MockJournalModel()
resourceModel = MockResourceModel()

# JWT Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401
        
        try:
            # In a real app, verify token here
            # For now, just assume it's valid and get user_id from it
            user_id = 'mock-id'  # This would come from the token
            
            # Store user_id for the route function
            request.user_id = user_id
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
            
    return decorated

# Default route
@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Mental Health Companion API is running'
    })

# User authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
            
        # Register user
        result = userModel.createUser(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Missing email or password'
            }), 400
            
        # Authenticate user
        result = userModel.authenticateUser(data.get('email'), data.get('password'))
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# User profile routes
@app.route('/api/user', methods=['GET'])
@token_required
def get_user_profile():
    try:
        user = userModel.getUserById(request.user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
        return jsonify({
            'success': True,
            'user': user
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/user', methods=['PUT'])
@token_required
def update_user_profile():
    try:
        data = request.json
        result = userModel.updateUser(request.user_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Chat route
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            }), 400
        
        result = chatController.processMessage(message)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
            'response': {
                'text': "I'm sorry, I'm having trouble understanding right now. Could you try rephrasing?",
                'detectedEmotion': 'unknown',
                'confidence': 0
            }
        }), 500

# Mood tracking routes
@app.route('/api/moods', methods=['GET'])
@token_required
def get_moods():
    try:
        # Check for date range parameters
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        if start_date and end_date:
            result = moodModel.getUserMoodsByDateRange(request.user_id, start_date, end_date)
        else:
            result = moodModel.getUserMoods(request.user_id)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/moods/stats', methods=['GET'])
@token_required
def get_mood_stats():
    try:
        result = moodModel.getUserMoodStats(request.user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/moods', methods=['POST'])
@token_required
def add_mood():
    try:
        data = request.json
        
        # Validate required field
        if not data.get('mood'):
            return jsonify({
                'success': False,
                'message': 'Mood is required'
            }), 400
            
        result = moodModel.addMood(request.user_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/moods/<mood_id>', methods=['PUT'])
@token_required
def update_mood(mood_id):
    try:
        data = request.json
        result = moodModel.updateMood(request.user_id, mood_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/moods/<mood_id>', methods=['DELETE'])
@token_required
def delete_mood(mood_id):
    try:
        result = moodModel.deleteMood(request.user_id, mood_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Journal routes
@app.route('/api/journal', methods=['GET'])
@token_required
def get_journal_entries():
    try:
        # Check for search parameter
        search_term = request.args.get('search')
        
        # Check for date range parameters
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        if search_term:
            result = journalModel.searchEntries(request.user_id, search_term)
        elif start_date and end_date:
            result = journalModel.getUserEntriesByDateRange(request.user_id, start_date, end_date)
        else:
            result = journalModel.getUserEntries(request.user_id)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/journal/stats', methods=['GET'])
@token_required
def get_journal_stats():
    try:
        result = journalModel.getUserJournalStats(request.user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/journal/<entry_id>', methods=['GET'])
@token_required
def get_journal_entry(entry_id):
    try:
        result = journalModel.getEntry(request.user_id, entry_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/journal', methods=['POST'])
@token_required
def add_journal_entry():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({
                'success': False,
                'message': 'Title and content are required'
            }), 400
            
        result = journalModel.addEntry(request.user_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/journal/<entry_id>', methods=['PUT'])
@token_required
def update_journal_entry(entry_id):
    try:
        data = request.json
        result = journalModel.updateEntry(request.user_id, entry_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/journal/<entry_id>', methods=['DELETE'])
@token_required
def delete_journal_entry(entry_id):
    try:
        result = journalModel.deleteEntry(request.user_id, entry_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Resources routes
@app.route('/api/resources', methods=['GET'])
def get_resources():
    try:
        # Check for parameters
        resource_type = request.args.get('type')
        search_term = request.args.get('search')
        featured = request.args.get('featured')
        
        if resource_type:
            result = resourceModel.getResourcesByType(resource_type)
        elif search_term:
            result = resourceModel.searchResources(search_term)
        elif featured == 'true':
            result = resourceModel.getFeaturedResources()
        else:
            result = resourceModel.getAllResources()
            
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/resources/crisis', methods=['GET'])
def get_crisis_resources():
    try:
        result = resourceModel.getCrisisResources()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Admin routes for resource management (would require admin authentication in a real app)
@app.route('/api/resources', methods=['POST'])
@token_required
def add_resource():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('description') or not data.get('url') or not data.get('type'):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
            
        result = resourceModel.addResource(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/resources/<resource_id>', methods=['PUT'])
@token_required
def update_resource(resource_id):
    try:
        data = request.json
        result = resourceModel.updateResource(resource_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/resources/<resource_id>', methods=['DELETE'])
@token_required
def delete_resource(resource_id):
    try:
        result = resourceModel.deleteResource(resource_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/resources/<resource_id>/toggle-featured', methods=['POST'])
@token_required
def toggle_featured_resource(resource_id):
    try:
        result = resourceModel.toggleFeatured(resource_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# User settings routes
@app.route('/api/user/settings', methods=['GET'])
@token_required
def get_settings():
    try:
        user = userModel.getUserById(request.user_id)
        
        if not user or not user.get('settings'):
            return jsonify({
                'success': True,
                'settings': {
                    'notifications': {
                        'email': True,
                        'push': True,
                        'reminders': True
                    },
                    'privacy': {
                        'dataSharing': False,
                        'anonymousAnalytics': True
                    }
                }
            })
            
        return jsonify({
            'success': True,
            'settings': user.get('settings')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/user/settings', methods=['PUT'])
@token_required
def update_settings():
    try:
        data = request.json
        result = userModel.updateUserSettings(request.user_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/user/password', methods=['PUT'])
@token_required
def change_password():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({
                'success': False,
                'message': 'Current and new passwords are required'
            }), 400
            
        result = userModel.changePassword(
            request.user_id, 
            data.get('currentPassword'), 
            data.get('newPassword')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/user', methods=['DELETE'])
@token_required
def delete_account():
    try:
        result = userModel.deleteUser(request.user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting server on port {port}")
    app.run(host='127.0.0.1', port=port, debug=os.getenv('FLASK_ENV') == 'development') 