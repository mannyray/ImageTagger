from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import os.path


app = Flask(__name__)
CORS(app)


if os.path.exists('data.pkl'):
    save_file = open("data.pkl", "rb")
    tags = pickle.load(save_file)
else:
    tags = {}


@app.route('/tags')
def get_incomes():
    return jsonify(tags)

@app.route('/tag_for_image',methods=['POST'])
def get_tags():
    data = request.get_json()
    print(data)
    if data['image_name'] in tags:
       print(tags)
       print(tags[data['image_name']])
       return jsonify(tags[data['image_name']]) 
    else:
        return jsonify([])



@app.route('/tags', methods=['POST'])
def add_income():
    print(request.get_json())
    data = request.get_json()
    tags[data['image_name']] = data['tags']
    
    save_file = open("data.pkl", "wb")
    pickle.dump(tags, save_file)
    save_file.close()

    return '', 200
