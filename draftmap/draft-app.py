import sqlite3
from flask import Flask, render_template, g

app = Flask(__name__)
DATABASE = '/home/alexander/evac-maps/draftmap/draftmap.db'

# Helper functions to interact with the SQLite database
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def init_draft_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Route for main page
@app.route('/draft-map')
def draft_map():
    # Load the current map and POI state from the database
    current_map = query_db('SELECT map_name FROM current_map LIMIT 1', one=True)
    poi_list = query_db('SELECT poi_name FROM poi_state')

    # Pass data to the template for JavaScript to handle interactions
    return render_template('draft_index.html', current_map=current_map, poi_list=poi_list)

# Update and retrieve data directly using SQLite commands
def set_current_map(map_name):
    db = get_db()
    db.execute('UPDATE current_map SET map_name = ? WHERE id = 1', (map_name,))
    db.commit()

def get_current_map():
    current_map = query_db('SELECT map_name FROM current_map WHERE id = 1', one=True)
    return current_map if current_map else "default_map"

def save_draft_table(draft_table):
    db = get_db()
    db.executemany('INSERT INTO draft_table (team_name, poi, pick_order) VALUES (?, ?, ?)', draft_table)
    db.commit()

def get_draft_table():
    return query_db('SELECT team_name, poi, pick_order FROM draft_table')

def reset_poi_state():
    db = get_db()
    db.execute('UPDATE poi_state SET state = 0')
    db.commit()

def get_poi_state():
    return query_db('SELECT poi_name, state FROM poi_state')
