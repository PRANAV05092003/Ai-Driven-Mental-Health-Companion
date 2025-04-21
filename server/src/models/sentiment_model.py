import tensorflow as tf
import numpy as np
import pandas as pd
import re
import os
import json
from sklearn.preprocessing import OneHotEncoder
from nltk.tokenize import word_tokenize
import nltk

# Download necessary NLTK data
nltk.download('punkt', quiet=True)

class SentimentModel:
    def __init__(self):
        self.model = None
        self.word_index = {}
        self.max_sequence_length = 50
        self.vocab_size = 5000
        self.labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
        
    def preprocess_text(self, text):
        """Preprocess text for the model."""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters and numbers
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', '', text)
        # Tokenize
        tokens = word_tokenize(text)
        # Convert to sequence
        sequence = []
        for i in range(self.max_sequence_length):
            if i < len(tokens):
                token = tokens[i]
                if token in self.word_index:
                    sequence.append(self.word_index[token])
                else:
                    sequence.append(0)  # OOV token
            else:
                sequence.append(0)  # Padding
        return sequence
    
    def build_vocabulary(self, training_data_path):
        """Build vocabulary from training data."""
        print("Building vocabulary...")
        word_frequency = {}
        total_words = 0
        
        # Read CSV file
        df = pd.read_csv(training_data_path)
        
        # Process each text
        for text in df['text']:
            tokens = word_tokenize(text.lower())
            for token in tokens:
                if token not in word_frequency:
                    word_frequency[token] = 0
                word_frequency[token] += 1
                total_words += 1
        
        # Sort words by frequency
        sorted_words = sorted(word_frequency.keys(), 
                             key=lambda x: word_frequency[x], 
                             reverse=True)
        
        # Create word index (top N words)
        self.word_index = {}
        # Reserve 0 for padding and 1 for OOV
        self.word_index['<PAD>'] = 0
        self.word_index['<OOV>'] = 1
        
        # Add top words to vocabulary
        top_words = sorted_words[:self.vocab_size - 2]
        for index, word in enumerate(top_words):
            self.word_index[word] = index + 2
        
        print(f"Vocabulary built with {len(self.word_index)} words")
    
    def load_data(self, file_path):
        """Load data from CSV file."""
        print(f"Loading data from {file_path}...")
        df = pd.read_csv(file_path)
        
        # Preprocess texts
        sequences = []
        for text in df['text']:
            sequence = self.preprocess_text(text)
            sequences.append(sequence)
        
        # Convert to numpy arrays
        X = np.array(sequences)
        
        # One-hot encode labels
        encoder = OneHotEncoder(sparse=False, categories=[range(6)])
        y = encoder.fit_transform(df['label'].values.reshape(-1, 1))
        
        return X, y
    
    def create_model(self):
        """Create the neural network model."""
        model = tf.keras.Sequential([
            # Embedding layer
            tf.keras.layers.Embedding(
                input_dim=self.vocab_size,
                output_dim=50,
                input_length=self.max_sequence_length
            ),
            
            # Global average pooling
            tf.keras.layers.GlobalAveragePooling1D(),
            
            # Hidden layer
            tf.keras.layers.Dense(128, activation='relu'),
            
            # Dropout to prevent overfitting
            tf.keras.layers.Dropout(0.5),
            
            # Output layer (6 emotions)
            tf.keras.layers.Dense(6, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train(self, training_data_path, validation_data_path, epochs=10, batch_size=32):
        """Train the model with the provided data."""
        try:
            # Build vocabulary from training data
            self.build_vocabulary(training_data_path)
            
            # Create model
            self.create_model()
            
            # Load training data
            X_train, y_train = self.load_data(training_data_path)
            
            # Load validation data
            X_val, y_val = self.load_data(validation_data_path)
            
            # Train model
            print("Training model...")
            history = self.model.fit(
                X_train, y_train,
                epochs=epochs,
                batch_size=batch_size,
                validation_data=(X_val, y_val),
                verbose=1
            )
            
            print("Model training complete")
            return True, history
        except Exception as e:
            print(f"Error training model: {e}")
            return False, None
    
    def save_model(self, path):
        """Save the model to a file."""
        if self.model is None:
            raise ValueError("No model to save")
        
        try:
            # Create directory if it doesn't exist
            os.makedirs(path, exist_ok=True)
            
            # Save the model
            self.model.save(os.path.join(path, 'model.h5'))
            
            # Save word index
            with open(os.path.join(path, 'word_index.json'), 'w') as f:
                json.dump(self.word_index, f)
            
            print(f"Model saved to {path}")
            return True
        except Exception as e:
            print(f"Error saving model: {e}")
            return False
    
    def load_model(self, path):
        """Load the model from a file."""
        try:
            # Load the model
            self.model = tf.keras.models.load_model(os.path.join(path, 'model.h5'))
            
            # Load word index
            with open(os.path.join(path, 'word_index.json'), 'r') as f:
                self.word_index = json.load(f)
            
            print(f"Model loaded from {path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def predict(self, text):
        """Predict sentiment for a text."""
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Preprocess text
        sequence = self.preprocess_text(text)
        
        # Make prediction
        input_data = np.array([sequence])
        prediction = self.model.predict(input_data)
        probabilities = prediction[0]
        
        # Get emotion with highest probability
        max_index = np.argmax(probabilities)
        max_prob = probabilities[max_index]
        
        # Return result
        return {
            "emotion": self.labels[max_index],
            "probability": float(max_prob),
            "all_emotions": [
                {"emotion": label, "probability": float(prob)}
                for label, prob in zip(self.labels, probabilities)
            ]
        }
    
    def analyze_sentiment_fallback(self, text):
        """Simple sentiment analysis as fallback."""
        try:
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            nltk.download('vader_lexicon', quiet=True)
            
            # Use VADER for sentiment analysis
            sid = SentimentIntensityAnalyzer()
            scores = sid.polarity_scores(text)
            
            # Map VADER scores to our emotions
            compound = scores['compound']
            
            if compound <= -0.5:
                return {"emotion": "anger", "probability": 0.8}
            elif compound < 0:
                return {"emotion": "sadness", "probability": 0.7}
            elif compound == 0:
                return {"emotion": "surprise", "probability": 0.5}
            elif compound <= 0.5:
                return {"emotion": "joy", "probability": 0.7}
            else:
                return {"emotion": "love", "probability": 0.8}
        except Exception:
            # If VADER is not available, use a simpler approach
            # Count positive and negative words
            positive_words = ["good", "great", "happy", "joy", "love", "positive", "excellent", "wonderful", "amazing"]
            negative_words = ["bad", "sad", "unhappy", "angry", "hate", "negative", "terrible", "awful", "pain"]
            
            tokens = word_tokenize(text.lower())
            positive_count = sum(1 for word in tokens if word in positive_words)
            negative_count = sum(1 for word in tokens if word in negative_words)
            
            if negative_count > positive_count and negative_count > 2:
                return {"emotion": "anger", "probability": 0.8}
            elif negative_count > positive_count:
                return {"emotion": "sadness", "probability": 0.7}
            elif positive_count == negative_count:
                return {"emotion": "surprise", "probability": 0.5}
            elif positive_count > negative_count:
                return {"emotion": "joy", "probability": 0.7}
            else:
                return {"emotion": "love", "probability": 0.8}

# Example usage
if __name__ == "__main__":
    model = SentimentModel()
    
    # Train model
    training_path = "path/to/training.csv"
    validation_path = "path/to/validation.csv"
    test_path = "path/to/test.csv"
    
    if os.path.exists(training_path) and os.path.exists(validation_path):
        success, _ = model.train(training_path, validation_path, epochs=5)
        if success:
            model.save_model("./models/sentiment")
            
            # Test model
            test_text = "I feel really happy today!"
            result = model.predict(test_text)
            print(f"Text: {test_text}")
            print(f"Predicted emotion: {result['emotion']} ({result['probability']:.2f})")
    else:
        print("Using fallback sentiment analysis...")
        test_text = "I feel really sad today."
        result = model.analyze_sentiment_fallback(test_text)
        print(f"Text: {test_text}")
        print(f"Predicted emotion: {result['emotion']} ({result['probability']:.2f})") 