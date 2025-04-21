import React, { useState, useEffect, useRef } from 'react';
import { BsVolumeUp, BsVolumeMute, BsStop } from 'react-icons/bs';

const TextToSpeech = ({ text, autoPlay = false }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  const utteranceRef = useRef(null);
  
  // Check if speech synthesis is supported
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
      return;
    }
    
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a default voice (preferably a female voice for the AI assistant)
      const englishVoices = availableVoices.filter(
        voice => voice.lang.includes('en-')
      );
      
      // Try to find a female voice
      const femaleVoice = englishVoices.find(
        voice => voice.name.includes('female') || 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') ||
                voice.name.includes('Karen')
      );
      
      setSelectedVoice(femaleVoice || (englishVoices.length > 0 ? englishVoices[0] : availableVoices[0]));
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    // Clean up
    return () => {
      stopSpeaking();
    };
  }, []);
  
  // Auto-play when text changes if autoPlay is enabled
  useEffect(() => {
    if (autoPlay && text && isSpeechSupported && !isSpeaking) {
      speak();
    }
  }, [text, autoPlay, isSpeechSupported]);
  
  const speak = () => {
    if (!isSpeechSupported || !text.trim() || !selectedVoice) return;
    
    // Cancel any ongoing speech
    stopSpeaking();
    
    // Create a new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    // Set voice
    utteranceRef.current.voice = selectedVoice;
    
    // Set rate and pitch
    utteranceRef.current.rate = 1.0;
    utteranceRef.current.pitch = 1.0;
    
    // Set event handlers
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utteranceRef.current);
    setIsSpeaking(true);
    setIsPaused(false);
  };
  
  const pauseSpeaking = () => {
    if (isSpeechSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  const resumeSpeaking = () => {
    if (isSpeechSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const stopSpeaking = () => {
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };
  
  const toggleSpeaking = () => {
    if (!isSpeechSupported) return;
    
    if (isSpeaking) {
      if (isPaused) {
        resumeSpeaking();
      } else {
        pauseSpeaking();
      }
    } else {
      speak();
    }
  };
  
  if (!isSpeechSupported || !text) {
    return null;
  }
  
  return (
    <div className="inline-flex items-center">
      <button
        onClick={toggleSpeaking}
        className={`p-2 rounded-full ${
          isSpeaking 
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={isSpeaking ? (isPaused ? 'Resume speaking' : 'Pause speaking') : 'Listen to this message'}
      >
        {isSpeaking ? (
          isPaused ? <BsVolumeUp className="w-4 h-4" /> : <BsVolumeMute className="w-4 h-4" />
        ) : (
          <BsVolumeUp className="w-4 h-4" />
        )}
      </button>
      
      {isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="ml-1 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Stop speaking"
        >
          <BsStop className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TextToSpeech; 