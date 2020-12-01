from flask import Flask, render_template, url_for, jsonify, request
from flask_talisman import Talisman
import random
import pickle
import requests
import os
import re
import pdb
import json

# Get the google API key from an environment variable
GOOGLE_API_KEY = os.environ['GOOGLE_API_KEY']

GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2"

GOOGLE_TRANSLATE_ENDPOINT_WITH_KEY = GOOGLE_TRANSLATE_ENDPOINT + "?key=" + GOOGLE_API_KEY

GOOGLE_TEXT_TO_SPEECH_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"

GOOGLE_TEXT_TO_SPEECH_ENDPOINT_WITH_KEY = GOOGLE_TEXT_TO_SPEECH_ENDPOINT + "?key=" + GOOGLE_API_KEY

GOOGLE_SPEECH_TO_TEXT_ENDPOINT = 'https://speech.googleapis.com/v1p1beta1/speech:recognize'

GOOGLE_SPEECH_TO_TEXT_ENDPOINT_WITH_KEY = GOOGLE_SPEECH_TO_TEXT_ENDPOINT + "?key=" + GOOGLE_API_KEY

NON_200_STATUS_CODES = []

# Import the pickle file which contains the langauge pairs
infile = open('languages_pickle','rb')
langs = pickle.load(infile)
infile.close()

app = Flask(__name__)

# TODO:
# It looks like providing an empty content security policy
# allows all of my CSP to be loaded appropriately, and hopefully forces https
# Look into explicitly whitelisting content: https://github.com/GoogleCloudPlatform/flask-talisman
csp = {}

Talisman(app,
	     content_security_policy=csp)


@app.route('/correct_answer')
def correct_answer():
	return render_template('output-correct.html')

@app.route('/incorrect_answer/<string:google_heard>/<string:target_L2_word>')
def incorrect_answer(google_heard, target_L2_word):
	## Pass in the correct values to be displayed in this screen
	
	incorrect_info = {"googleHeard": google_heard,
	                 "target_L2_word": target_L2_word}

	return render_template('output-wrong.html', incorrectInfo = incorrect_info)

@app.route('/score/<string:translate_to_code>/<string:L2TargetWord>', methods=['GET', 'POST'])
def score(translate_to_code, L2TargetWord):

	r = request.get_json()

	user_L2_recording = r['userL2Recording']

	print("******Start*******")
	print(user_L2_recording)
	print("******END*********")
	
	# Payload for translation api
	google_speech_to_text_payload = {
		"config": {
      		"encoding":"MP3",
      		"sampleRateHertz": 16000,
      		"languageCode": translate_to_code
  		},
  		"audio": {
  			"content": user_L2_recording
  		}
  	}

	print("****Payload************")
	print(google_speech_to_text_payload)
	
	speech_recognition_result = make_api_request(GOOGLE_SPEECH_TO_TEXT_ENDPOINT_WITH_KEY,
									 google_speech_to_text_payload,
									 method='POST')

	
	# If the make_api_request() method returns false, then send that message tot he
	# Front end
	if (speech_recognition_result == False):
		return jsonify({"isCorrect": False,
		            "redirectURL": "",
		            "googleHeard": "",
		            "targetL2Word": "",
		            "error": "API Request Failed in Backend"})
	
	print("****speech_recognition_result****")
	print(speech_recognition_result)

	# REFACTOR ALL OF THIS:
	try:
		recognized_speech = speech_recognition_result['results'][0]['alternatives'][0]['transcript']
	except Exception as e:
		print('Here is the exception: '+ str(e))

		return jsonify({"isCorrect": False,
		            "redirectURL": "",
		            "googleHeard": "",
		            "targetL2Word": "",
		            "error": str(e)})


	if (recognized_speech.lower() == L2TargetWord.lower()):
		is_correct = True
		redirect_url = "/correct_answer"
	else:
		is_correct = False
		redirect_url = "/incorrect_answer"

	return jsonify({"isCorrect": is_correct,
		            "redirectURL": redirect_url,
		            "googleHeard": recognized_speech.lower(),
		            "targetL2Word": L2TargetWord.lower()})
		


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
	google_text_to_speech_payload = {
  		"input": {
    		"text": L2_Target_Word
  		},
 		"voice": {
    		"languageCode": translate_to_code,
    		# TODO SPECIFY THE NAME OF THE VOICE WE ARE GOING TO USE
  			#"name": "en-US-Wavenet-C",
  			"ssmlGender": "FEMALE"
  		},
  		"audioConfig": {
    		"audioEncoding": "LINEAR16",
  			"speakingRate": 1,
  			"pitch": 0,
  		}
	}


	audio_results = make_api_request(GOOGLE_TEXT_TO_SPEECH_ENDPOINT_WITH_KEY,
									 google_text_to_speech_payload,
									 method='POST')


	# Extract the string that we are going to play
	base_64_audio_string = audio_results['audioContent']

	# Return a JSON response with flask::jsonify to browser
	return jsonify({"target_word": L2_Target_Word,
					"target_audio": base_64_audio_string})

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

	
	try:

		response = requests.request(method, url, headers=headers, json = payload)

		if (int(response.status_code) != 200):
			NON_200_STATUS_CODES.append(str(response.status_code))
			# Configure this to send a message to slack:
			send_non_200_status_codes()
	
	except requests.exceptions.RequestException as e:
		# Print Out the string nd return string that says FALSE
		print(str(e))
		print("An API Request failed")
		return False

	return response.json()

def send_non_200_status_codes():

	# TODO CONFIGURE THIS TO SEND MESSAGES TO SLACK
	print(NON_200_STATUS_CODES)


if __name__ == '__main__':
    app.run()