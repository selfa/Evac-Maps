# lootpath.py

from flask import Flask, render_template

lootpath = Flask(__name__)

@lootpath.route('/lootpath')
def lootpath_page():
    return render_template('lootpath.html')

if __name__ == '__main__':
    lootpath.run(debug=True, host='0.0.0.0', port=8003)
