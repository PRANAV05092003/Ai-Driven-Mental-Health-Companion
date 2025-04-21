const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const csv = require('csv-parser');
const natural = require('natural');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = natural;
const tokenizer = new WordTokenizer();

// Sentiment labels
// 0: sadness
// 1: joy
// 2: love
// 3: anger
// 4: fear
// 5: surprise

class SentimentModel {
  constructor() {
    this.model = null;
    this.wordIndex = {};
    this.maxSequenceLength = 50;
    this.vocabSize = 5000;
    this.labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise'];
  }

  // Preprocess text for the model
  preprocessText(text) {
    // Convert to lowercase
    text = text.toLowerCase();
    // Remove special characters and numbers
    text = text.replace(/[^\w\s]/g, '');
    text = text.replace(/\d+/g, '');
    // Tokenize
    const tokens = tokenizer.tokenize(text);
    // Convert to sequence
    const sequence = [];
    for (let i = 0; i < this.maxSequenceLength; i++) {
      if (i < tokens.length) {
        const token = tokens[i];
        if (this.wordIndex[token]) {
          sequence.push(this.wordIndex[token]);
        } else {
          sequence.push(0); // OOV token
        }
      } else {
        sequence.push(0); // Padding
      }
    }
    return sequence;
  }

  // Build vocabulary from training data
  async buildVocabulary(trainingDataPath) {
    return new Promise((resolve, reject) => {
      const wordFrequency = {};
      let totalWords = 0;

      fs.createReadStream(trainingDataPath)
        .pipe(csv())
        .on('data', (row) => {
          const text = row.text;
          const tokens = tokenizer.tokenize(text.toLowerCase());
          tokens.forEach(token => {
            if (!wordFrequency[token]) {
              wordFrequency[token] = 0;
            }
            wordFrequency[token] += 1;
            totalWords += 1;
          });
        })
        .on('end', () => {
          // Sort words by frequency
          const sortedWords = Object.keys(wordFrequency).sort((a, b) => 
            wordFrequency[b] - wordFrequency[a]
          );
          
          // Create word index (top N words)
          this.wordIndex = {};
          // Reserve 0 for padding and 1 for OOV
          this.wordIndex['<PAD>'] = 0;
          this.wordIndex['<OOV>'] = 1;
          
          // Add top words to vocabulary
          const topWords = sortedWords.slice(0, this.vocabSize - 2);
          topWords.forEach((word, index) => {
            this.wordIndex[word] = index + 2;
          });
          
          console.log(`Vocabulary built with ${Object.keys(this.wordIndex).length} words`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Load data from CSV file
  async loadData(filePath) {
    return new Promise((resolve, reject) => {
      const data = [];
      const labels = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const text = row.text;
          const label = parseInt(row.label);
          
          // Preprocess and convert to sequence
          const sequence = this.preprocessText(text);
          data.push(sequence);
          
          // One-hot encode label
          const oneHotLabel = Array(6).fill(0);
          oneHotLabel[label] = 1;
          labels.push(oneHotLabel);
        })
        .on('end', () => {
          // Convert to tensors
          const xTensor = tf.tensor2d(data);
          const yTensor = tf.tensor2d(labels);
          
          resolve({ x: xTensor, y: yTensor });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Create the neural network model
  createModel() {
    this.model = tf.sequential();
    
    // Embedding layer
    this.model.add(tf.layers.embedding({
      inputDim: this.vocabSize,
      outputDim: 50,
      inputLength: this.maxSequenceLength
    }));
    
    // Flatten the 3D tensor to 2D
    this.model.add(tf.layers.globalAveragePooling1d());
    
    // Hidden layer
    this.model.add(tf.layers.dense({
      units: 128,
      activation: 'relu'
    }));
    
    // Dropout to prevent overfitting
    this.model.add(tf.layers.dropout({ rate: 0.5 }));
    
    // Output layer (6 emotions)
    this.model.add(tf.layers.dense({
      units: 6,
      activation: 'softmax'
    }));
    
    // Compile model
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return this.model;
  }

  // Train the model with the provided data
  async train(trainingDataPath, validationDataPath, epochs = 10, batchSize = 32) {
    try {
      // Build vocabulary from training data
      await this.buildVocabulary(trainingDataPath);
      
      // Create model
      this.createModel();
      
      // Load training data
      console.log('Loading training data...');
      const trainingData = await this.loadData(trainingDataPath);
      
      // Load validation data
      console.log('Loading validation data...');
      const validationData = await this.loadData(validationDataPath);
      
      // Train model
      console.log('Training model...');
      await this.model.fit(trainingData.x, trainingData.y, {
        epochs,
        batchSize,
        validationData: [validationData.x, validationData.y],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1} - loss: ${logs.loss.toFixed(4)} - accuracy: ${logs.acc.toFixed(4)} - val_loss: ${logs.val_loss.toFixed(4)} - val_acc: ${logs.val_acc.toFixed(4)}`);
          }
        }
      });
      
      console.log('Model training complete');
      return true;
    } catch (error) {
      console.error('Error training model:', error);
      return false;
    }
  }

  // Save the model to a file
  async saveModel(path) {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    try {
      // Save the model
      await this.model.save(`file://${path}`);
      
      // Save word index
      fs.writeFileSync(`${path}/word_index.json`, JSON.stringify(this.wordIndex));
      
      console.log(`Model saved to ${path}`);
      return true;
    } catch (error) {
      console.error('Error saving model:', error);
      return false;
    }
  }

  // Load the model from a file
  async loadModel(path) {
    try {
      // Load the model
      this.model = await tf.loadLayersModel(`file://${path}/model.json`);
      
      // Load word index
      const wordIndexData = fs.readFileSync(`${path}/word_index.json`, 'utf8');
      this.wordIndex = JSON.parse(wordIndexData);
      
      console.log(`Model loaded from ${path}`);
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  // Predict sentiment for a text
  async predict(text) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    
    // Preprocess text
    const sequence = this.preprocessText(text);
    
    // Make prediction
    const input = tf.tensor2d([sequence]);
    const prediction = this.model.predict(input);
    const probabilities = await prediction.data();
    
    // Get emotion with highest probability
    let maxIndex = 0;
    let maxProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }
    
    // Return result
    return {
      emotion: this.labels[maxIndex],
      probability: maxProb,
      allEmotions: this.labels.map((label, index) => ({
        emotion: label,
        probability: probabilities[index]
      }))
    };
  }

  // Simple sentiment analysis using natural library as fallback
  analyzeSentimentFallback(text) {
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const result = analyzer.getSentiment(tokenizer.tokenize(text));
    
    // Map result to our emotions
    // AFINN returns a score between -5 and 5
    if (result <= -3) {
      return { emotion: 'anger', probability: 0.8 };
    } else if (result < 0) {
      return { emotion: 'sadness', probability: 0.7 };
    } else if (result === 0) {
      return { emotion: 'surprise', probability: 0.5 };
    } else if (result <= 3) {
      return { emotion: 'joy', probability: 0.7 };
    } else {
      return { emotion: 'love', probability: 0.8 };
    }
  }
}

module.exports = SentimentModel; 