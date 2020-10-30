from flask import Flask, render_template, url_for
import random

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/input')
def view_abc():
    return render_template('input.html')


@app.route('/win')
def win_or_loose():
    flip = random.randint(0, 1)
    if flip:
        return render_template('output-wrong.html')
    else:
        return render_template('output-correct.html')
