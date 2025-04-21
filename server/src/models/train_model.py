import os
import argparse
from sentiment_model import SentimentModel
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
import seaborn as sns

def plot_training_history(history, save_path=None):
    """Plot training and validation accuracy/loss."""
    # Create figure with 2 subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Plot training and validation accuracy
    ax1.plot(history.history['accuracy'])
    ax1.plot(history.history['val_accuracy'])
    ax1.set_title('Model Accuracy')
    ax1.set_ylabel('Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.legend(['Train', 'Validation'], loc='upper left')
    
    # Plot training and validation loss
    ax2.plot(history.history['loss'])
    ax2.plot(history.history['val_loss'])
    ax2.set_title('Model Loss')
    ax2.set_ylabel('Loss')
    ax2.set_xlabel('Epoch')
    ax2.legend(['Train', 'Validation'], loc='upper left')
    
    plt.tight_layout()
    
    # Save the plot if a path is provided
    if save_path:
        plt.savefig(save_path)
        print(f"Training history plot saved to {save_path}")
    
    plt.show()

def evaluate_model(model, test_path, save_path=None):
    """Evaluate the model on test data and generate metrics."""
    print(f"Evaluating model on {test_path}...")
    
    # Load test data
    X_test, y_test = model.load_data(test_path)
    
    # Get predictions
    y_pred_prob = model.model.predict(X_test)
    y_pred = np.argmax(y_pred_prob, axis=1)
    y_true = np.argmax(y_test, axis=1)
    
    # Calculate classification report
    report = classification_report(
        y_true, y_pred, 
        target_names=model.labels,
        output_dict=True
    )
    
    # Print classification report
    print("\nClassification Report:")
    report_df = pd.DataFrame(report).transpose()
    print(report_df)
    
    # Create confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm, 
        annot=True, 
        fmt='d', 
        cmap='Blues',
        xticklabels=model.labels,
        yticklabels=model.labels
    )
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Save the plot if a path is provided
    if save_path:
        cm_path = os.path.join(os.path.dirname(save_path), 'confusion_matrix.png')
        plt.savefig(cm_path)
        print(f"Confusion matrix saved to {cm_path}")
        
        # Save classification report
        report_path = os.path.join(os.path.dirname(save_path), 'classification_report.csv')
        report_df.to_csv(report_path)
        print(f"Classification report saved to {report_path}")
    
    plt.show()
    
    # Calculate overall accuracy
    accuracy = (y_pred == y_true).mean()
    print(f"\nOverall Accuracy: {accuracy:.4f}")
    
    return report, cm

def main():
    parser = argparse.ArgumentParser(description='Train sentiment analysis model')
    parser.add_argument('--training', required=True, help='Path to training data CSV')
    parser.add_argument('--validation', required=True, help='Path to validation data CSV')
    parser.add_argument('--test', required=True, help='Path to test data CSV')
    parser.add_argument('--model_dir', default='./models/sentiment', help='Directory to save model')
    parser.add_argument('--epochs', type=int, default=10, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--evaluate_only', action='store_true', help='Only evaluate an existing model')
    
    args = parser.parse_args()
    
    # Create model directory if it doesn't exist
    os.makedirs(args.model_dir, exist_ok=True)
    
    # Initialize model
    model = SentimentModel()
    
    if args.evaluate_only:
        # Load existing model
        model_loaded = model.load_model(args.model_dir)
        if not model_loaded:
            print("Failed to load model. Exiting.")
            return
    else:
        # Train model
        print(f"Training model with {args.epochs} epochs and batch size {args.batch_size}...")
        success, history = model.train(
            args.training, 
            args.validation, 
            epochs=args.epochs, 
            batch_size=args.batch_size
        )
        
        if not success:
            print("Model training failed. Exiting.")
            return
        
        # Save model
        model.save_model(args.model_dir)
        
        # Plot training history
        history_path = os.path.join(args.model_dir, 'training_history.png')
        plot_training_history(history, history_path)
    
    # Evaluate model on test data
    evaluate_model(model, args.test, os.path.join(args.model_dir, 'evaluation.png'))
    
    print(f"Model training and evaluation complete. Model saved to {args.model_dir}")

if __name__ == "__main__":
    main() 