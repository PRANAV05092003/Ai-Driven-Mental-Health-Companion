import pyttsx3
import threading
import logging
import time
import io
from contextlib import redirect_stdout, redirect_stderr

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TextToSpeech:
    """Python implementation of text-to-speech similar to the React TextToSpeech component"""
    
    def __init__(self):
        """Initialize the text-to-speech engine"""
        try:
            # Redirect stdout/stderr to avoid pyttsx3 init messages
            with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
                self.engine = pyttsx3.init()
            
            # Get available voices
            self.voices = self.engine.getProperty('voices')
            
            # Set default properties
            self.engine.setProperty('rate', 175)  # Speed - words per minute
            self.engine.setProperty('volume', 1.0)  # Volume (0.0 to 1.0)
            
            # Try to select a female voice if available
            self._select_voice()
            
            self.is_speaking = False
            self.is_paused = False
            self.current_text = None
            self.thread = None
            self.lock = threading.Lock()
            self.is_speech_supported = True
            
            logger.info("Text-to-speech engine initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing text-to-speech engine: {e}")
            self.is_speech_supported = False
            self.engine = None
    
    def _select_voice(self):
        """Select a suitable voice for the engine"""
        if not self.voices:
            logger.warning("No voices available")
            return
        
        # Try to find an English female voice
        female_voice = None
        english_voice = None
        
        for voice in self.voices:
            voice_id = voice.id
            # Check if it's a female voice
            if any(term in voice.name.lower() for term in ['female', 'woman', 'girl', 'samantha', 'karen']):
                if 'en' in voice.languages[0].lower():
                    # Found an English female voice
                    female_voice = voice
                    break
                elif female_voice is None:
                    # Found a female voice but not English
                    female_voice = voice
            
            # Check if it's an English voice
            if english_voice is None and 'en' in voice.languages[0].lower():
                english_voice = voice
        
        # Set the voice (prioritize English female, then any female, then any English, then first voice)
        selected_voice = female_voice or english_voice or self.voices[0]
        self.engine.setProperty('voice', selected_voice.id)
        logger.info(f"Selected voice: {selected_voice.name}")
    
    def speak(self, text, block=False):
        """
        Speak the given text
        
        Args:
            text: The text to speak
            block: Whether to block until speech is complete
        
        Returns:
            bool: True if speech started successfully, False otherwise
        """
        if not self.is_speech_supported or not text or not text.strip():
            return False
        
        with self.lock:
            # Stop any current speech
            self.stop()
            
            self.current_text = text
            self.is_speaking = True
            self.is_paused = False
            
            if block:
                # Blocking mode - speak directly
                try:
                    self.engine.say(text)
                    self.engine.runAndWait()
                    self.is_speaking = False
                    self.current_text = None
                    return True
                except Exception as e:
                    logger.error(f"Error in text-to-speech: {e}")
                    self.is_speaking = False
                    self.current_text = None
                    return False
            else:
                # Non-blocking mode - speak in a separate thread
                self.thread = threading.Thread(target=self._speak_thread)
                self.thread.daemon = True
                self.thread.start()
                return True
    
    def _speak_thread(self):
        """Background thread for non-blocking speech"""
        try:
            self.engine.say(self.current_text)
            self.engine.runAndWait()
        except Exception as e:
            logger.error(f"Error in text-to-speech thread: {e}")
        finally:
            with self.lock:
                self.is_speaking = False
                self.is_paused = False
    
    def pause(self):
        """Pause the current speech"""
        if not self.is_speech_supported or not self.is_speaking or self.is_paused:
            return False
        
        with self.lock:
            try:
                self.engine.stop()
                self.is_paused = True
                logger.info("Speech paused")
                return True
            except Exception as e:
                logger.error(f"Error pausing speech: {e}")
                return False
    
    def resume(self):
        """Resume paused speech"""
        if not self.is_speech_supported or not self.is_speaking or not self.is_paused:
            return False
        
        with self.lock:
            try:
                # We have to re-say the text
                if self.current_text:
                    self.thread = threading.Thread(target=self._speak_thread)
                    self.thread.daemon = True
                    self.thread.start()
                    
                self.is_paused = False
                logger.info("Speech resumed")
                return True
            except Exception as e:
                logger.error(f"Error resuming speech: {e}")
                return False
    
    def stop(self):
        """Stop the current speech"""
        if not self.is_speech_supported or not self.is_speaking:
            return False
        
        with self.lock:
            try:
                self.engine.stop()
                self.is_speaking = False
                self.is_paused = False
                logger.info("Speech stopped")
                return True
            except Exception as e:
                logger.error(f"Error stopping speech: {e}")
                return False
    
    def toggle(self):
        """Toggle between speaking, paused, and stopped states"""
        with self.lock:
            if not self.is_speaking:
                # Not speaking, start if we have text
                if self.current_text:
                    return self.speak(self.current_text)
                return False
            elif self.is_paused:
                # Paused, resume
                return self.resume()
            else:
                # Speaking, pause
                return self.pause()
    
    def set_rate(self, rate):
        """Set the speech rate (words per minute)"""
        if not self.is_speech_supported:
            return False
        
        with self.lock:
            try:
                self.engine.setProperty('rate', rate)
                logger.info(f"Speech rate set to {rate}")
                return True
            except Exception as e:
                logger.error(f"Error setting speech rate: {e}")
                return False
    
    def set_volume(self, volume):
        """Set the speech volume (0.0 to 1.0)"""
        if not self.is_speech_supported:
            return False
        
        with self.lock:
            try:
                self.engine.setProperty('volume', max(0.0, min(1.0, volume)))
                logger.info(f"Speech volume set to {volume}")
                return True
            except Exception as e:
                logger.error(f"Error setting speech volume: {e}")
                return False
    
    def get_status(self):
        """Get the current status of the text-to-speech engine"""
        return {
            'is_supported': self.is_speech_supported,
            'is_speaking': self.is_speaking,
            'is_paused': self.is_paused,
            'current_text': self.current_text
        }

# Example usage
if __name__ == "__main__":
    tts = TextToSpeech()
    
    if tts.is_speech_supported:
        print("Text-to-speech engine initialized successfully.")
        print("Available commands:")
        print("- speak [text]: Speak the given text")
        print("- pause: Pause speech")
        print("- resume: Resume speech")
        print("- stop: Stop speech")
        print("- rate [value]: Set speech rate (default: 175)")
        print("- volume [value]: Set speech volume 0-10 (default: 10)")
        print("- quit/exit: Exit the program")
        
        try:
            while True:
                cmd = input("\nEnter command: ").strip()
                
                if cmd.lower() in ['quit', 'exit']:
                    break
                elif cmd.lower() == 'pause':
                    tts.pause()
                elif cmd.lower() == 'resume':
                    tts.resume()
                elif cmd.lower() == 'stop':
                    tts.stop()
                elif cmd.lower().startswith('rate '):
                    try:
                        rate = int(cmd.split(' ', 1)[1])
                        tts.set_rate(rate)
                        print(f"Rate set to {rate}")
                    except:
                        print("Invalid rate. Please provide a number.")
                elif cmd.lower().startswith('volume '):
                    try:
                        volume = float(cmd.split(' ', 1)[1]) / 10
                        tts.set_volume(volume)
                        print(f"Volume set to {volume*10}/10")
                    except:
                        print("Invalid volume. Please provide a number between 0 and 10.")
                elif cmd.lower().startswith('speak '):
                    text = cmd.split(' ', 1)[1]
                    tts.speak(text)
                else:
                    print("Unknown command. Try speak, pause, resume, stop, rate, volume, or quit.")
        except KeyboardInterrupt:
            print("\nExiting...")
    else:
        print("Text-to-speech engine initialization failed.") 