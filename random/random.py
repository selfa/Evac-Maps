from flask import Flask, request, render_template, redirect, url_for
import os

# Initialize the Flask app
app = Flask(__name__)

# Set the folder where uploaded images will be stored
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Allowable file extensions

# Make sure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Check if the file has a valid extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to display the upload form and handle file uploads
@app.route('/upload', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            return "No file part", 400
        file = request.files['file']
        
        # If no file is selected, browser submits an empty file without a filename
        if file.filename == '':
            return "No selected file", 400
        
        # If the file is allowed, save it to the server
        if file and allowed_file(file.filename):
            filename = file.filename
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)  # Save the file locally
            return f"File uploaded successfully: {filepath}", 200


    # If the request is GET, render the upload form
    return render_template('random.html')

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8006)
