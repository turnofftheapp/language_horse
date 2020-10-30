from flask import Flask, render_template, url_for
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/input')
def view_abc():
    return render_template('input.html')


@app.route('/win')
def win_or_loose():
    return render_template('output-wrong.html')