from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import os

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')
app.secret_key = 'supersecretkey'  # You should change this to a random secret key

# Use absolute path for the database to ensure it is found regardless of the working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'markers.db')

# Hardcoded users (username: password)
USERS = {
    'user1': 'password1',
    'user2': 'password2'
}

# Function to initialize the database
def init_db():
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS markers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lat REAL,
                lng REAL,
                color TEXT,
                youtube_link TEXT
            )
        ''')
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    else:
        print("Database already exists.")

# Route to handle login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Check if the username and password are correct
        if username in USERS and USERS[username] == password:
            session['username'] = username  # Store the username in the session
            return redirect(url_for('select_app'))
        else:
            return render_template('login.html', error="Invalid username or password")

    return render_template('login.html')

# Route to handle logout
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

# Route to select which app to access
@app.route('/select_app')
def select_app():
    if 'username' not in session:
        return redirect(url_for('login'))

    return render_template('select_app.html')

# Home route to render the map (protected route)
@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))

    return render_template('index.html')

# Route to add a new marker
@app.route('/add_marker', methods=['POST'])
def add_marker():
    try:
        data = request.json
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''
            INSERT INTO markers (lat, lng, color, youtube_link) 
            VALUES (?, ?, ?, ?)
        ''', (data['coords']['lat'], data['coords']['lng'], data['color'], data['youtube_link']))
        conn.commit()
        conn.close()
        return jsonify({'status': 'Marker added successfully'})
    except Exception as e:
        print(f"Error in /add_marker: {e}")
        return jsonify({'status': 'Error adding marker', 'error': str(e)})

# Route to retrieve all markers
@app.route('/get_markers', methods=['GET'])
def get_markers():
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('SELECT lat, lng, color, youtube_link FROM markers')
        markers = [{'lat': row[0], 'lng': row[1], 'color': row[2], 'youtube_link': row[3]} for row in c.fetchall()]
        conn.close()
        return jsonify(markers)
    except Exception as e:
        print(f"Error in /get_markers: {e}")
        return jsonify({'status': 'Error retrieving markers', 'error': str(e)})

# Route to delete a marker
@app.route('/delete_marker', methods=['POST'])
def delete_marker():
    try:
        data = request.json
        lat = data.get('lat')
        lng = data.get('lng')

        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''
            DELETE FROM markers 
            WHERE lat = ? AND lng = ?
        ''', (lat, lng))
        conn.commit()
        conn.close()

        return jsonify({'status': 'Marker deleted successfully'})
    except Exception as e:
        print(f"Error in /delete_marker: {e}")
        return jsonify({'status': 'Error deleting marker', 'error': str(e)})

# Run the Flask app
if __name__ == '__main__':
    init_db()  # Initialize the database on startup if it doesn't exist
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
