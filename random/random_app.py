from flask import Flask, request, render_template, redirect, url_for, send_from_directory
import os

# Initialize Flask app
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
@app.route('/random', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            return "No file part", 400
        file = request.files['file']
        
        # Get the custom filename from the form, if provided
        custom_filename = request.form.get('filename')
        
        # If no file is selected, browser submits an empty file without a filename
        if file.filename == '':
            return "No selected file", 400
        
        # If no custom filename is provided, use the original file name
        if not custom_filename:
            custom_filename = file.filename
        
        # Ensure the custom filename has a valid extension
        if allowed_file(file.filename):
            # Save the file with the custom filename
            filepath = os.path.join(UPLOAD_FOLDER, custom_filename)
            file.save(filepath)  # Save the file locally
            return f"File uploaded successfully: {filepath}", 200

        return "Invalid file format. Please upload an image.", 400

    # If the request is GET, render the upload form and the list of images
    image_list = os.listdir(UPLOAD_FOLDER)
    image_list = [img for img in image_list if allowed_file(img)]  # Filter valid images
    return render_template('random.html', images=image_list)

# Route to view the uploaded image
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Route to delete an image
@app.route('/delete/<filename>', methods=['POST'])
def delete_image(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return redirect(url_for('upload_image'))  # Redirect to the upload page
    return "File not found", 404

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8006)
