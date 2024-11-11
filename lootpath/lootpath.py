# lootpath.py

from flask import Flask, render_template

app = Flask(__name__, static_folder=None, template_folder='templates')

@app.route('/lootpath')
def lootpath_page():
    return render_template('lootpath.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8003)
