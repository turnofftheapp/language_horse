from flask import Flask, render_template, url_for
import random
import pickle

# Import the pickle file which contains the langauge pairs
infile = open('languages_pickle','rb')
langs = pickle.load(infile)
infile.close()

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/translate/<string:transate_from_code>/<string:translate_to_code>/<string:L1_word>', methods=['GET', 'POST'])
def translate(transate_from_code, translate_to_code, L1_word):
	print(transate_from_code)
	print(translate_to_code)
	print(L1_word)
	return "Hola Mundo"




@app.route('/input')
def view_abc():
    return render_template('input.html', langs=langs)


@app.route('/win')
def win_or_loose():
    flip = random.randint(0, 1)
    if flip:
        return render_template('output-wrong.html')
    else:
        return render_template('output-correct.html')
