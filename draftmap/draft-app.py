from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os

app = Flask(__name__, static_folder='/home/alexander/evac-maps/draftmap/static', template_folder='/home/alexander/evac-maps/draftmap/templates')


# Route for the new Draftmap app
@app.route('/draft-map')
def draft_map():
    return render_template('/home/alexander/evac-maps/draftmap/draft_index.html')


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8002)
