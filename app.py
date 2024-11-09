from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')

# Path to the SQLite database
EVAC_DATABASE = 'markers.db'
DRAFT_DATABASE = 'app_state.db'

# Function to initialize the evac map database (markers.db)
def init_evac_db():
    if not os.path.exists(EVAC_DATABASE):
        conn = sqlite3.connect(EVAC_DATABASE)
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

# Function to initialize the draft map database (app_state.db)
def init_draft_db():
    conn = sqlite3.connect(DRAFT_DATABASE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS state (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        current_map TEXT,
                        draft_table_state TEXT,
                        poi_state TEXT,
                        order_count INTEGER
                      )''')
    conn.commit()
    conn.close()

# Initialize both databases
init_evac_db()
init_draft_db()
# Front page route
@app.route('/')
def front_page():
    return render_template('front_page.html')

# Route to the evacuation map app
@app.route('/evac-map')
def index():
    return render_template('index.html')

# Route for the new Draftmap app
@app.route('/draft-map')
def draft_map():
    return render_template('draft_index.html')

# Route to add a new marker
@app.route('/add_marker', methods=['POST'])
def add_marker():
    try:
        data = request.json
        conn = sqlite3.connect(EVAC_DATABASE)
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
        conn = sqlite3.connect(EVAC_DATABASE)
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

        conn = sqlite3.connect(EVAC_DATABASE)
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
    

    # New Endpoint to save the state
@app.route('/saveState', methods=['POST'])
def save_state():
    data = request.json
    current_map = data.get('currentMap', 'stormpoint')
    draft_table_state = data.get('draftTableState', '[]')
    poi_state = data.get('poiState', '[]')
    order_count = data.get('orderCount', 1)

    conn = sqlite3.connect('app_state.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM state')  # Clear old state to store new one
    cursor.execute('INSERT INTO state (current_map, draft_table_state, poi_state, order_count) VALUES (?, ?, ?, ?)',
                   (current_map, draft_table_state, poi_state, order_count))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"}), 201


        # New Endpoint to load the state
@app.route('/loadState', methods=['GET'])
def load_state():
    conn = sqlite3.connect('app_state.db')
    cursor = conn.cursor()
    cursor.execute('SELECT current_map, draft_table_state, poi_state, order_count FROM state ORDER BY id DESC LIMIT 1')
    result = cursor.fetchone()
    conn.close()

    if result:
        current_map, draft_table_state, poi_state, order_count = result
        return jsonify({
            "currentMap": current_map,
            "draftTableState": draft_table_state,
            "poiState": poi_state,
            "orderCount": order_count
        })
    else:
        # Return default state if no data found
        return jsonify({
            "currentMap": "stormpoint",
            "draftTableState": "[]",
            "poiState": "[]",
            "orderCount": 1
        })

# Run the Flask app
if __name__ == '__main__':
    init_evac_db()
    init_draft_db()  # Initialize the database on startup if it doesn't exist
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
