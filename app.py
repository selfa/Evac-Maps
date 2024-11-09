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

# Initialize Draft Map database without affecting the EVAC map database
def init_draft_db():
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS maps (name TEXT PRIMARY KEY)''')
    c.execute('''CREATE TABLE IF NOT EXISTS poilist (id INTEGER PRIMARY KEY, name TEXT, map TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS drafttable (id INTEGER PRIMARY KEY, poi_id INTEGER, teamname TEXT, pick_order INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS poistate (id INTEGER PRIMARY KEY, poi_id INTEGER, state TEXT)''')
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
    

# New routes for Draft Map only
@app.route('/api/get_current_map', methods=['GET'])
def get_current_map():
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("SELECT name FROM maps LIMIT 1")
    current_map = c.fetchone()
    conn.close()
    return jsonify({'currentMap': current_map[0] if current_map else 'stormpoint'})

@app.route('/api/set_current_map', methods=['POST'])
def set_current_map():
    data = request.json
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("DELETE FROM maps")
    c.execute("INSERT INTO maps (name) VALUES (?)", (data['currentMap'],))
    conn.commit()
    conn.close()
    return jsonify({'status': 'Map updated'})

@app.route('/api/get_poi_list', methods=['GET'])
def get_poi_list():
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("SELECT id, name FROM poilist WHERE map=?", (request.args.get('map'),))
    pois = [{'id': row[0], 'name': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(pois)

@app.route('/api/save_draft_table', methods=['POST'])
def save_draft_table():
    data = request.json
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("DELETE FROM drafttable")
    for entry in data['draftTable']:
        c.execute("INSERT INTO drafttable (poi_id, teamname, pick_order) VALUES (?, ?, ?)",
                  (entry['poi_id'], entry['teamName'], entry['pickOrder']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'Draft table saved'})

@app.route('/api/get_draft_table', methods=['GET'])
def get_draft_table():
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("SELECT poi_id, teamname, pick_order FROM drafttable")
    draft_table = [{'poi_id': row[0], 'teamName': row[1], 'pickOrder': row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify(draft_table)

@app.route('/api/save_poi_state', methods=['POST'])
def save_poi_state():
    data = request.json
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("DELETE FROM poistate")
    for state in data['poiState']:
        c.execute("INSERT INTO poistate (poi_id, state) VALUES (?, ?)", (state['poi_id'], state['state']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'POI state saved'})

@app.route('/api/get_poi_state', methods=['GET'])
def get_poi_state():
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("SELECT poi_id, state FROM poistate")
    poi_state = [{'poi_id': row[0], 'state': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(poi_state)

@app.route('/api/remove_draft_entry', methods=['POST'])
def remove_draft_entry():
    poi_id = request.args.get('poi_id')
    conn = sqlite3.connect('draft_map.db')
    c = conn.cursor()
    c.execute("DELETE FROM drafttable WHERE poi_id = ?", (poi_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'Entry removed'})


# Run the Flask app
if __name__ == '__main__':
    init_evac_db()
    init_draft_db()  # Initialize the database on startup if it doesn't exist
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
