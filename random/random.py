import os
from flask import Flask, request, jsonify
from google.cloud import storage
from google.auth.transport.requests import Request

app = Flask(__name__)

# Set your Google Cloud Storage bucket name
bucket_name = 'noth-image-upload'  # Replace with your actual bucket name

# Set your Google Cloud credentials file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/static/draft-app-441219-093f5e039576.json"

# Initialize Google Cloud Storage client
storage_client = storage.Client()

@app.route('/random')
def index():
    return 'Flask Image Upload App'

@app.route('/getSignedUrl', methods=['GET'])
def get_signed_url():
    """Generate a signed URL for uploading images to Cloud Storage."""
    # Define the filename for the image
    file_name = f"uploads/{str(int(time.time()))}_image.png"  # Unique name for each image

    # Reference the Cloud Storage bucket
    bucket = storage_client.bucket(bucket_name)

    # Get the file reference within the bucket
    blob = bucket.blob(file_name)

    # Set the expiration time (e.g., 15 minutes)
    expiration_time = 15 * 60  # 15 minutes

    # Generate the signed URL for uploading the image
    url = blob.generate_signed_url(
        expiration=expiration_time,
        method="PUT",
        content_type="image/png",  # Ensure the content type is handled correctly
    )

    return jsonify({"signedUrl": url})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8005)