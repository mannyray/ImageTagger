from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import os.path
import numpy as np
import shutil
import glob
import search
import tagging
import store

app = Flask(__name__)
CORS(app)

@app.route('/upload',methods=['POST'])
def fileUpload():
    store.upload(request.args.get('path',default='',type=str),request.files['file'])
    return jsonify([])

@app.route('/images_session',methods=['GET'])
def getImagesSession():
    return jsonify(store.get_files(request.args.get('path',default='',type=str)))

#return all the tags for a provided image name
@app.route('/get_tags_for_image',methods=['GET'])
def get_tags():
    return jsonify(store.get_tags(request.args.get('path',default='',type=str),request.args.get('image_name',default='',type=str)))

@app.route('/save_tags_for_image', methods=['POST'])
def add_tags():
    data = request.get_json()
    store.save_tags(data['save_directory'],data['image_name'],data['tags'])
    return jsonify([])

@app.route('/get_specific_image',methods=['GET'])
def get_specific_image():
    return store.get_image(request.args.get('page',default='',type=str),request.args.get('image',default='',type=str))

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#for searching things


'''
-- filter by code
-- filter by message
-- filter by unknown
-- filter by img
'''
@app.route('/all_tags_and_frequency',methods=['GET'])
def get_all_tags_and_frequency():
    return jsonify([str(x)+' '+str(store.tagToImages[x]) for x in store.tagToImages])

@app.route('/get_all_codes',methods=['GET'])
def get_all_codes():
    return jsonify(search.search_get_all_codes(store.tagToImages))


@app.route('/get_all_images_for_tag',methods=['GET'])
def get_all_images_for_tag():
    return jsonify(search.search_get_all_images_for_tag(request.args.get('page',default='',type=str),store.tagToImages))

@app.route('/get_specific_tags',methods=['GET'])
def get_specific_tag():
    return jsonify(search.search_get_specific_tag(request.args.get('train',default='',type=str),store.folder_to_image_to_tags))

@app.route('/group_by_similarity',methods=['GET'])
def group_by_similarity():
    return jsonify(search.search_group_by_similarity(store.tagToImages))

