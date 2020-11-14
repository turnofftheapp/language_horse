from flask import Flask, render_template, url_for
import random
import pickle
import requests
import os
import re
import pdb
import json
import pdb

# Get the google API key from an environment variable
GOOGLE_API_KEY = os.environ['GOOGLE_API_KEY']

GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2"

GOOGLE_TRANSLATE_ENDPOINT_WITH_KEY = GOOGLE_TRANSLATE_ENDPOINT + "?key=" + GOOGLE_API_KEY

GOOGLE_TEXT_TO_SPEECH_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"

GOOGLE_TEXT_TO_SPEECH_ENDPOINT_WITH_KEY = GOOGLE_TEXT_TO_SPEECH_ENDPOINT + "?key=" + GOOGLE_API_KEY

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

	
	
	# Payload for translation api
	google_translate_payload = {"q": L1_word,
			   "source": translate_from_code_no_suffix,
			   "target": translate_to_code_no_suffix,
			   "type": "text"}

	
	translation_results = make_api_request(GOOGLE_TRANSLATE_ENDPOINT_WITH_KEY, google_translate_payload, method='POST')
	L2_Target_Word = translation_results['data']['translations'][0]['translatedText']

	
	# Payload for translation api
	google_speech_to_text_payload = {
  		"input": {
    		"text": "Max"
  		},
 		"voice": {
    		"languageCode": "en-US",
  			"name": "en-US-Wavenet-C",
  			"ssmlGender": "FEMALE"
  		},
  		"audioConfig": {
    		"audioEncoding": "MP3",
  			"speakingRate": 2,
  			"pitch": 0,
  		}
	}


	audio_results = make_api_request(GOOGLE_TEXT_TO_SPEECH_ENDPOINT_WITH_KEY, google_text_to_speech_payload, method='POST')

	print("********AUDIO:::::")
	print(audio_results)

	pdb.set_trace()

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

def make_api_request(url, payload, method):

	# TODO: ADD ERROR HANDLING TO THIS METHOD

	headers = {
  		'Content-Type': 'application/json'
	}

	response = requests.request(method, url, headers=headers, json = payload)
	
	return response.json()
