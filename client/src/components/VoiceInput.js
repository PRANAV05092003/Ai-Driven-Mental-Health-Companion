import React, { useState, useEffect, useRef } from 'react';
import { BsMicFill, BsMicMuteFill, BsStopFill } from 'react-icons/bs';

const VoiceInput = ({ onTranscript, isDisabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  
  // Setup speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSpeechRecognitionSupported(false);
      setError('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access to use voice input.');
      } else {
        setError(`Error: ${event.error}`);
      }
      stopListening();
    };
    
    recognitionRef.current.onend = () => {
      if (isListening) {
        // Auto restart if we're still meant to be listening
        recognitionRef.current.start();
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  
  const toggleListening = () => {
    if (isDisabled) return;
    
    if (!isSpeechRecognitionSupported) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    setError('');
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start listening. Please try again.');
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
      // Only send transcript if it's not empty
      if (transcript.trim()) {
        onTranscript(transcript);
        setTranscript('');
      }
    }
  };
  
  return (
    <div className="relative">
      {error && (
        <div className="absolute bottom-full mb-2 left-0 bg-red-100 text-red-800 text-xs p-1 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={toggleListening}
        disabled={isDisabled || !isSpeechRecognitionSupported}
        className={`p-2 rounded-full ${
          isDisabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={isSpeechRecognitionSupported ? 'Click to use voice input' : 'Speech recognition not supported'}
      >
        {isListening ? (
          <BsStopFill className="w-5 h-5" />
        ) : isSpeechRecognitionSupported ? (
          <BsMicFill className="w-5 h-5" />
        ) : (
          <BsMicMuteFill className="w-5 h-5" />
        )}
      </button>
      
      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-700 p-2 rounded shadow-md text-sm max-w-xs">
          <p className="text-gray-700 dark:text-gray-300">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 