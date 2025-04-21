import React, { useState, useEffect, useRef } from 'react';
import speechService from '../services/speechService';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaSpinner } from 'react-icons/fa';

const SpeechControl = ({ 
  onSpeechResult, 
  textToSpeak,
  autoPlay = false,
  className = '',
  buttonClassName = '',
  showText = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState({ tts: false, asr: false });
  const [statusMessage, setStatusMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  
  // Check if speech services are supported
  useEffect(() => {
    const checkSpeechSupport = async () => {
      try {
        const support = await speechService.checkSupport();
        setSpeechSupported(support);
      } catch (error) {
        console.error('Failed to check speech support:', error);
        setSpeechSupported({ tts: false, asr: false });
      }
    };
    
    checkSpeechSupport();
  }, []);
  
  // Auto-play text when it changes
  useEffect(() => {
    if (autoPlay && textToSpeak && !isPlaying && speechSupported.tts) {
      handleSpeak();
    }
  }, [textToSpeak, autoPlay, speechSupported.tts]);
  
  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current);
        audioRef.current = null;
      }
      
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch (error) {
          console.error('Error stopping media recorder:', error);
        }
      }
    };
  }, []);
  
  const handleStartRecording = async () => {
    if (!speechSupported.asr) {
      setStatusMessage('Speech recognition is not supported');
      return;
    }
    
    try {
      setIsLoading(true);
      setStatusMessage('Starting microphone...');
      
      const recorder = await speechService.recordAudio();
      mediaRecorderRef.current = recorder;
      
      setIsRecording(true);
      setStatusMessage('Recording...');
      
      // Set up event for when recording stops
      recorder.addEventListener('stop', async () => {
        setIsRecording(false);
        setStatusMessage('Processing speech...');
        
        try {
          const { audioBlob } = await new Promise((resolve) => {
            if (mediaRecorderRef.current.state === 'inactive') {
              resolve({ audioBlob: new Blob(mediaRecorderRef.current.chunks, { type: 'audio/wav' }) });
            }
          });
          
          const result = await speechService.recognizeSpeech(audioBlob);
          
          if (result.success && result.transcript) {
            setStatusMessage('');
            if (onSpeechResult) {
              onSpeechResult(result.transcript);
            }
          } else {
            setStatusMessage(result.error || 'No speech detected');
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
          setStatusMessage('Failed to process speech');
        } finally {
          setIsLoading(false);
        }
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatusMessage('Failed to start recording');
      setIsLoading(false);
      setIsRecording(false);
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage('Processing speech...');
    }
  };
  
  const handleSpeak = async () => {
    if (!textToSpeak || !speechSupported.tts) {
      setStatusMessage('Text-to-speech is not supported or no text provided');
      return;
    }
    
    try {
      setIsLoading(true);
      setStatusMessage('Generating speech...');
      
      const result = await speechService.synthesizeSpeech(textToSpeak);
      
      if (result.success && result.audioUrl) {
        audioRef.current = result.audioUrl;
        setIsPlaying(true);
        setStatusMessage('Playing speech...');
        
        await speechService.playSpeech(result.audioUrl);
        
        setIsPlaying(false);
        setStatusMessage('');
      } else {
        setStatusMessage('Failed to generate speech');
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setStatusMessage('Failed to generate or play speech');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStopSpeaking = () => {
    if (audioRef.current) {
      const audio = document.querySelector(`audio[src="${audioRef.current}"]`);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(false);
      setStatusMessage('');
    }
  };
  
  return (
    <div className={`speech-control ${className}`}>
      {/* Recording controls */}
      {speechSupported.asr && (
        <button
          type="button"
          className={`speech-btn record-btn ${buttonClassName}`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isLoading}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isLoading && !isRecording ? (
            <FaSpinner className="animate-spin" />
          ) : isRecording ? (
            <FaMicrophoneSlash />
          ) : (
            <FaMicrophone />
          )}
        </button>
      )}
      
      {/* Text-to-speech controls */}
      {speechSupported.tts && textToSpeak && (
        <button
          type="button"
          className={`speech-btn speak-btn ${buttonClassName}`}
          onClick={isPlaying ? handleStopSpeaking : handleSpeak}
          disabled={isLoading && !isPlaying}
          aria-label={isPlaying ? 'Stop speaking' : 'Speak text'}
          title={isPlaying ? 'Stop speaking' : 'Speak text'}
        >
          {isLoading && !isPlaying ? (
            <FaSpinner className="animate-spin" />
          ) : isPlaying ? (
            <FaStop />
          ) : (
            <FaPlay />
          )}
        </button>
      )}
      
      {/* Status message */}
      {showText && statusMessage && (
        <span className="speech-status text-sm text-gray-600 ml-2">
          {statusMessage}
        </span>
      )}
    </div>
  );
};

export default SpeechControl; 