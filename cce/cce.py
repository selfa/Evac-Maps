from flask import Flask, render_template

app = Flask(__name__, static_folder='static')

@app.route('/cce')
def lootpath_page():
    return render_template('cce.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8003)
