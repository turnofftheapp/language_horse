from flask import Flask, render_template, url_for
app = Flask(__name__)

# Let's render the first route
@app.route('/')
def hello_world():
    return render_template('index.html')