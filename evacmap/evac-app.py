from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')

# Path to the SQLite database
EVAC_DATABASE = '/home/alexander/evacmaps/evacmap/markers.db'

# Function to initialize the evac map database (markers.db)
def init_evac_db():
    if not os.path.exists(EVAC_DATABASE):
        conn = sqlite3.connect(f'file:{EVAC_DATABASE}?mode=rwc', uri=True)
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


# Initialize both databases
init_evac_db()

# Front page route
@app.route('/')
def front_page():
    return render_template('front_page.html')

# Route to the evacuation map app
@app.route('/evac-map')
def index():
    return render_template('index.html')

# Route to add a new marker
@app.route('/add_marker', methods=['POST'])
def add_marker():
    try:
        data = request.json
        conn = sqlite3.connect(f'file:{EVAC_DATABASE}?mode=rwc', uri=True)
        c = conn.cursor()
        c.execute('''
            INSERT INTO markers (lat, lng, color, youtube_link) 
            VALUES (?, ?, ?, ?)
        ''', (data['coords']['lat'], data['coords']['lng'], data['color'], data['youtube_link']))
        conn.commit()
        conn.close()
        return jsonify({'status': 'Marker added successfully'})
    except Exception as e:
        return jsonify({'status': 'Error adding marker', 'error': str(e)})

# Route to retrieve all markers
@app.route('/get_markers', methods=['GET'])
def get_markers():
    try:
        conn = sqlite3.connect(f'file:{EVAC_DATABASE}?mode=rwc', uri=True)
        c = conn.cursor()
        c.execute('SELECT lat, lng, color, youtube_link FROM markers')
        markers = [{'lat': row[0], 'lng': row[1], 'color': row[2], 'youtube_link': row[3]} for row in c.fetchall()]
        conn.close()
        return jsonify(markers)
    except Exception as e:
        return jsonify({'status': 'Error retrieving markers', 'error': str(e)})

# Route to delete a marker
@app.route('/delete_marker', methods=['POST'])
def delete_marker():
    try:
        data = request.json
        lat = data.get('lat')
        lng = data.get('lng')

        conn = sqlite3.connect(f'file:{EVAC_DATABASE}?mode=rwc', uri=True)
        c = conn.cursor()
        c.execute('''
            DELETE FROM markers 
            WHERE lat = ? AND lng = ?
        ''', (lat, lng))
        conn.commit()
        conn.close()

        return jsonify({'status': 'Marker deleted successfully'})
    except Exception as e:
        return jsonify({'status': 'Error deleting marker', 'error': str(e)})
    

# Run the Flask app
if __name__ == '__main__':
    init_evac_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
