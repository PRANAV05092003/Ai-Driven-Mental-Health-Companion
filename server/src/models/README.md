# Sentiment Analysis Model

This directory contains the implementation of a sentiment analysis model for classifying text into six emotional categories:
- sadness
- joy
- love
- anger
- fear
- surprise

## Model Architecture

The model uses a neural network with the following architecture:
- Embedding layer to convert tokenized text to vector representations
- Global Average Pooling to consolidate the embeddings
- Dense layer with ReLU activation
- Dropout layer (0.5) to prevent overfitting
- Output layer with softmax activation for 6 emotion classes

## Files

- `sentiment_model.py` - Contains the `SentimentModel` class with methods for preprocessing text, training the model, and making predictions
- `train_model.py` - Script for training and evaluating the model
- `models/sentiment/` - Directory where trained models are saved

## Requirements

- TensorFlow (>=2.4.0)
- NumPy
- Pandas
- NLTK
- Scikit-learn
- Matplotlib
- Seaborn

## Usage

### Training the Model

To train the model with the provided CSV files:

```bash
python train_model.py --training path/to/training.csv --validation path/to/validation.csv --test path/to/test.csv
```

Additional options:
- `--model_dir` - Directory to save the trained model (default: `./models/sentiment`)
- `--epochs` - Number of training epochs (default: 10)
- `--batch_size` - Batch size for training (default: 32)

### Evaluating an Existing Model

To evaluate an existing model without retraining:

```bash
python train_model.py --training path/to/training.csv --validation path/to/validation.csv --test path/to/test.csv --evaluate_only
```

### Using the Model in Python

```python
from sentiment_model import SentimentModel

# Initialize model
model = SentimentModel()

# Load pre-trained model
model.load_model('./models/sentiment')

# Predict sentiment for a text
text = "I feel really happy today!"
result = model.predict(text)
print(f"Emotion: {result['emotion']}, Probability: {result['probability']:.2f}")

# If no model is available, use fallback sentiment analysis
result = model.analyze_sentiment_fallback(text)
print(f"Fallback emotion: {result['emotion']}, Probability: {result['probability']:.2f}")
```

## Dataset Format

The expected format for CSV files is:
- A column named `text` containing the text samples
- A column named `label` containing integer labels (0-5) corresponding to the emotion classes

## Model Performance

After training, the following metrics will be generated:
- Training history plot (accuracy and loss)
- Confusion matrix
- Classification report with precision, recall, and F1-score for each emotion class
- Overall accuracy

These metrics are saved in the model directory and displayed during training.

## Fallback Mechanism

If a trained model is not available, the system falls back to a simpler sentiment analysis method using NLTK's VADER sentiment analyzer or a rule-based approach that counts positive and negative words. 