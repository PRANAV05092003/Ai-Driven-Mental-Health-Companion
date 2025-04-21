import speech_recognition as sr
import threading
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VoiceRecognizer:
    """Python implementation of voice input similar to the React VoiceInput component"""
    
    def __init__(self, callback=None, language='en-US'):
        """
        Initialize the voice recognizer
        
        Args:
            callback: Function to call when a transcript is ready
            language: Language code for speech recognition
        """
        self.recognizer = sr.Recognizer()
        self.callback = callback
        self.language = language
        self.is_listening = False
        self.transcript = ""
        self.error = None
        self.thread = None
        self.should_stop = threading.Event()
    
    def adjust_for_ambient_noise(self, duration=1):
        """Adjust for ambient noise for better recognition"""
        with sr.Microphone() as source:
            logger.info("Adjusting for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source, duration=duration)
            logger.info("Ambient noise adjustment complete")
    
    def start_listening(self):
        """Start listening for voice input"""
        if self.is_listening:
            logger.warning("Already listening")
            return False
        
        self.error = None
        self.transcript = ""
        self.is_listening = True
        self.should_stop.clear()
        
        # Start listening in a separate thread
        self.thread = threading.Thread(target=self._listen_thread)
        self.thread.daemon = True
        self.thread.start()
        
        logger.info("Started listening")
        return True
    
    def stop_listening(self):
        """Stop listening for voice input"""
        if not self.is_listening:
            logger.warning("Not currently listening")
            return False
        
        self.should_stop.set()
        if self.thread:
            self.thread.join(timeout=2)
        
        self.is_listening = False
        
        # Send final transcript to callback if available
        if self.callback and self.transcript.strip():
            self.callback(self.transcript)
        
        logger.info("Stopped listening")
        return True
    
    def toggle_listening(self):
        """Toggle between listening and not listening"""
        if self.is_listening:
            return self.stop_listening()
        else:
            return self.start_listening()
    
    def _listen_thread(self):
        """Background thread for continuous listening"""
        try:
            with sr.Microphone() as source:
                # Adjust for ambient noise initially
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                while not self.should_stop.is_set():
                    try:
                        # Listen for audio with a timeout
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=10)
                        
                        # Convert speech to text
                        text = self.recognizer.recognize_google(audio, language=self.language)
                        self.transcript = text
                        
                        logger.info(f"Recognized: {text}")
                        
                        # Call the callback if provided
                        if self.callback:
                            self.callback(text)
                            
                    except sr.WaitTimeoutError:
                        # Just a timeout, continue listening
                        pass
                    except sr.UnknownValueError:
                        # Speech was unintelligible
                        logger.debug("Could not understand audio")
                    except sr.RequestError as e:
                        # API was unreachable or unresponsive
                        error_msg = f"API unavailable: {e}"
                        logger.error(error_msg)
                        self.error = error_msg
                        # Short pause before retrying
                        time.sleep(1)
                    except Exception as e:
                        error_msg = f"Error in speech recognition: {e}"
                        logger.error(error_msg)
                        self.error = error_msg
                        # Short pause before retrying
                        time.sleep(1)
        except Exception as e:
            error_msg = f"Error initializing microphone: {e}"
            logger.error(error_msg)
            self.error = error_msg
            self.is_listening = False

# Example usage
if __name__ == "__main__":
    def print_transcript(text):
        print(f"Transcript: {text}")
    
    recognizer = VoiceRecognizer(callback=print_transcript)
    
    try:
        print("Say something...")
        recognizer.start_listening()
        
        # Keep the main thread alive
        try:
            while True:
                time.sleep(0.1)
                if recognizer.error:
                    print(f"Error: {recognizer.error}")
                    recognizer.error = None
        except KeyboardInterrupt:
            print("Stopping...")
    finally:
        recognizer.stop_listening() 