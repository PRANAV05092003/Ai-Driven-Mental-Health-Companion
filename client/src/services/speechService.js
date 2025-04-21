import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SpeechService {
  constructor() {
    this.apiUrl = `${API_URL}/api/speech`;
    this.isSupported = null;
    this.checkSupport();
  }

  // Check if speech services are supported
  async checkSupport() {
    try {
      const response = await axios.get(`${this.apiUrl}/status`);
      this.isSupported = {
        tts: response.data.tts_supported,
        asr: response.data.asr_supported
      };
      return this.isSupported;
    } catch (error) {
      console.error('Failed to check speech support:', error);
      this.isSupported = { tts: false, asr: false };
      return this.isSupported;
    }
  }

  // Convert speech to text using the API
  async recognizeSpeech(audioBlob, language = 'en-US') {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const response = await axios.post(`${this.apiUrl}/recognize`, {
        audio_data: base64Audio,
        content_type: audioBlob.type || 'audio/wav',
        language
      });
      
      return response.data;
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    }
  }

  // Convert text to speech using the API
  async synthesizeSpeech(text, options = {}) {
    try {
      const response = await axios.post(`${this.apiUrl}/synthesize`, {
        text,
        rate: options.rate || 175,
        volume: options.volume || 1.0
      });
      
      if (response.data.success) {
        // Convert base64 to audio
        const audioData = this.base64ToArrayBuffer(response.data.audio_data);
        const audioBlob = new Blob([audioData], { type: response.data.content_type || 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return {
          success: true,
          audioUrl,
          audioBlob
        };
      } else {
        throw new Error(response.data.error || 'Failed to synthesize speech');
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw error;
    }
  }

  // Play synthesized speech
  playSpeech(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = (error) => {
        reject(error);
      };
      
      audio.play().catch(reject);
      
      return audio; // Return the audio element for control
    });
  }

  // Utility function to convert Blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result
          .replace('data:', '')
          .replace(/^.+,/, '');
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Utility function to convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Record audio from the microphone
  async recordAudio(timeLimit = 10000) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      return new Promise((resolve, reject) => {
        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
          
          resolve({ audioBlob, audioUrl });
        });

        mediaRecorder.addEventListener('error', error => {
          reject(error);
        });

        // Start recording
        mediaRecorder.start();

        // Stop recording after timeLimit
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, timeLimit);

        // Return the media recorder so it can be stopped externally
        return mediaRecorder;
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }
}

export default new SpeechService(); 