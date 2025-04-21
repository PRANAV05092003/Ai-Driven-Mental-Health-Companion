from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import tempfile
import wave
import json
import logging
from text_to_speech import TextToSpeech
import speech_recognition as sr

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize text-to-speech engine
tts = TextToSpeech()

# Initialize speech recognizer
recognizer = sr.Recognizer()

@app.route('/api/speech/recognize', methods=['POST'])
def recognize_speech():
    """
    API endpoint to recognize speech from audio data
    
    Expected JSON payload:
    {
        "audio_data": "base64-encoded audio data",
        "content_type": "audio/wav",  // Or other audio format
        "language": "en-US"  // Optional, defaults to en-US
    }
    
    Returns:
    {
        "success": true/false,
        "transcript": "recognized text",
        "error": "error message if any"
    }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'audio_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing audio data'
            }), 400
        
        # Get audio data and content type
        audio_data_base64 = data.get('audio_data')
        content_type = data.get('content_type', 'audio/wav')
        language = data.get('language', 'en-US')
        
        # Decode base64 audio data
        audio_data = base64.b64decode(audio_data_base64)
        
        # Save audio data to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_filename = temp_file.name
            temp_file.write(audio_data)
        
        try:
            # Load audio file and recognize speech
            with sr.AudioFile(temp_filename) as source:
                audio = recognizer.record(source)
                transcript = recognizer.recognize_google(audio, language=language)
                
                return jsonify({
                    'success': True,
                    'transcript': transcript
                })
        except sr.UnknownValueError:
            return jsonify({
                'success': False,
                'error': 'Speech could not be understood'
            }), 400
        except sr.RequestError as e:
            return jsonify({
                'success': False,
                'error': f'Could not request results from Google Speech Recognition service: {e}'
            }), 500
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_filename)
            except Exception as e:
                logger.error(f"Error deleting temporary file: {e}")
    except Exception as e:
        logger.error(f"Error in speech recognition endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/speech/synthesize', methods=['POST'])
def synthesize_speech():
    """
    API endpoint to synthesize speech from text
    
    Expected JSON payload:
    {
        "text": "Text to be spoken",
        "rate": 175,  // Optional, speech rate in words per minute
        "volume": 1.0  // Optional, volume from 0.0 to 1.0
    }
    
    Returns:
    {
        "success": true/false,
        "audio_data": "base64-encoded audio data",
        "error": "error message if any"
    }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing text to synthesize'
            }), 400
        
        # Get text and optional parameters
        text = data.get('text')
        rate = data.get('rate', 175)
        volume = data.get('volume', 1.0)
        
        # Set rate and volume
        tts.set_rate(rate)
        tts.set_volume(volume)
        
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_filename = temp_file.name
        
        # Save audio to the temporary file
        if not tts.is_speech_supported:
            return jsonify({
                'success': False,
                'error': 'Text-to-speech is not supported on this server'
            }), 500
        
        try:
            # Use pyttsx3 to generate speech
            engine = tts.engine
            engine.save_to_file(text, temp_filename)
            engine.runAndWait()
            
            # Read the audio file and encode it as base64
            with open(temp_filename, 'rb') as audio_file:
                audio_data = audio_file.read()
                audio_data_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                return jsonify({
                    'success': True,
                    'audio_data': audio_data_base64,
                    'content_type': 'audio/wav'
                })
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_filename)
            except Exception as e:
                logger.error(f"Error deleting temporary file: {e}")
    except Exception as e:
        logger.error(f"Error in speech synthesis endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/speech/status', methods=['GET'])
def get_status():
    """
    API endpoint to get the status of the speech services
    
    Returns:
    {
        "tts_supported": true/false,
        "asr_supported": true/false
    }
    """
    try:
        # Check if text-to-speech is supported
        tts_supported = tts.is_speech_supported
        
        # Check if automatic speech recognition is supported
        asr_supported = True  # We assume SpeechRecognition is available as we're importing it
        
        return jsonify({
            'tts_supported': tts_supported,
            'asr_supported': asr_supported
        })
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return jsonify({
            'tts_supported': False,
            'asr_supported': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')
    
    logger.info(f"Starting speech API server on port {port}, debug={debug}")
    logger.info(f"Text-to-speech supported: {tts.is_speech_supported}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 