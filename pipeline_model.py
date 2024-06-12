import os
import sys
import pickle
import skimage.io
import skimage.color
import skimage.transform
import skimage.feature
import scipy.stats
import scipy.special
import numpy as np
import warnings
import json
warnings.filterwarnings("ignore", category=UserWarning)

# Paths to the scaler and model files
scaler_path = os.path.join(os.path.dirname(__file__), 'dsa_scaler.pickle')
model_path = os.path.join(os.path.dirname(__file__), 'dsa_image_classification_sgd.pickle')

# Load the scaler and model
with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

with open(model_path, 'rb') as f:
    model = pickle.load(f)

def pipeline_model(path, scaler_transform=scaler, model_sgd=model):
    try:
        # Read the image
        image = skimage.io.imread(path)
        
        # Resize the image to 80x80
        image_resize = skimage.transform.resize(image, (80, 80))
        image_scale = 255 * image_resize
        image_transform = image_scale.astype(np.uint8)
        
        # Convert the image to grayscale
        gray = skimage.color.rgb2gray(image_transform)
        
        # Extract HOG features
        feature_vector = skimage.feature.hog(
            gray,
            orientations=10,
            pixels_per_cell=(8, 8),
            cells_per_block=(2, 2)
        )
        
        # Scale the feature vector
        scalex = scaler_transform.transform(feature_vector.reshape(1, -1))
        
        # Predict the label
        result = model_sgd.predict(scalex)
        
        # Get the decision function values (confidence scores)
        decision_value = model_sgd.decision_function(scalex).flatten()
        labels = model_sgd.classes_
        
        # Calculate probabilities
        z = scipy.stats.zscore(decision_value)
        prob_value = scipy.special.softmax(z)
        
        # Get the top 5 predictions
        top_5_prob_ind = prob_value.argsort()[::-1][:5]
        top_labels = labels[top_5_prob_ind]
        top_prob = prob_value[top_5_prob_ind]
        
        # Create a dictionary with the top 5 labels and their probabilities
        top_dict = {key: np.round(val, 3) for key, val in zip(top_labels, top_prob)}
        
        return list(top_dict)[0]
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return {}
# path = os.path.join(os.path.dirname(__file__), 'eagle.jpg')
# result = pipeline_model(path, scaler, model)
# print(result)
if __name__ == "__main__":
    image_path = sys.argv[1]
    result = pipeline_model(image_path)
    print(json.dumps(result))
