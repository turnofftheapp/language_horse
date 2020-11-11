from flask import Flask, render_template, url_for
import random
import pickle
import requests
import os
import re
import pdb
import json



# Get the google API key from an environment variable
google_api_key = os.environ['GOOGLE_API_KEY']

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
	
	# Get the language codes with no dialect suffixes
	translate_from_code_no_suffix = re.sub(r'-..$', '', transate_from_code)
	translate_to_code_no_suffix = re.sub(r'-..$', '', translate_to_code)

	# Make a request to the google api key
	url = "https://translation.googleapis.com/language/translate/v2?key={}".format(google_api_key)
	
	#pdb.set_trace()

	payload = {"q": L1_word,
			   "source": translate_from_code_no_suffix,
			   "target": translate_to_code_no_suffix,
			   "type": "text"}

	headers = {
  		'Content-Type': 'application/json'
	}

	response = requests.request("POST", url, headers=headers, json = payload)
	parsed_response = response.json()
	L2_Target_Word = parsed_response['data']['translations'][0]['translatedText']

	return L2_Target_Word

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
