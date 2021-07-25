from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import os.path
import numpy as np

app = Flask(__name__)
CORS(app)


#tags -> maps file names to an an array of tags
#tags_inv -> maps tags to file names
if os.path.exists('data.pkl'):
    save_file = open("data.pkl", "rb")
    tags = pickle.load(save_file)
    tags_inv = {}
    for imageNameKey in tags:
        for tagOfImage in tags[imageNameKey]:
            if tagOfImage not in tags_inv:
                tags_inv[tagOfImage] = [ imageNameKey ]
            else:
                tmp = tags_inv[tagOfImage]
                tmp.append( imageNameKey )
                tags_inv[tagOfImage] = tmp
else:
    tags = {}
    tags_inv = {}


@app.route('/get_unique_tags',methods=['POST'])
def get_unique_tags():
    return jsonify([x for x in tags_inv])


@app.route('/images_for_tags',methods=['POST'])
def get_image_for_tags():
    #receive a bunch of tags and return matching images 
    data = request.get_json()
    desired_tags = data['desired_tags']

    all_images = [x for x in tags]
    for desired_tag in desired_tags:
        if desired_tag in tags_inv:#sanity check
            all_images = list( set(all_images) & set(tags_inv[desired_tag]))
    return jsonify(all_images)

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

    #TODO deleting tags when resaving

    for tagOfImage in data['tags']:
        if tagOfImage not in tags_inv:
            tags_inv[tagOfImage] = data['image_name']
        else:
            tmp = tags_inv[tagOfImage]
            tmp.append( data['image_name'] )
            tags_inv[tagOfImage] = tmp
    
    save_file = open("data.pkl", "wb")
    pickle.dump(tags, save_file)
    save_file.close()

    return '', 200
