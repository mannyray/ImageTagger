from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import os.path
import numpy as np

app = Flask(__name__)
CORS(app)

#tags -> dictionary: maps file names to an an array of tags
#tags_inv -> dictionary: maps tags to file names (inv for inverse)
#TODO we need the path
tags = {}
tags_inv = {}
saveDirectory = ''

#get all images in directory
@app.route('/get_images_in_directory_and_set_path',methods=['GET'])
def get_images_in_directory_and_set_path():
    global saveDirectory
    saveDirectory = request.args.get('save_directory',default='',type = str )
    if os.path.exists(saveDirectory + '/data.pkl'):
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
    try:
        os.makedirs(saveDirectory)
    except FileExistsError:
        print(saveDirectory+" already exists")

    directory = request.args.get('directory',default='',type = str )
    results = os.listdir(directory)
    files = []
    for f in results:
        if len(f) > 4 and f[-4:] == ".JPG":
            basename = f.split('.')[0]
            if basename+'.CR3' in results:
                files.append([f,basename+'.CR3'])
            else:
                files.append([f])
    return jsonify(files)

@app.route('/get_specific_image',methods=['GET'])
def get_specific_image():
    page = request.args.get('path',default='', type = str )
    print(page)
    return send_file(page, mimetype='image/jpg')

#get all the unique tags up to now
@app.route('/get_unique_tags',methods=['POST'])
def get_unique_tags():
    return jsonify([x for x in tags_inv])

#provided a list 
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

#return all the tags for a provided image name
@app.route('/tag_for_image',methods=['POST'])
def get_tags():
    data = request.get_json()
    print('getting tags for '+ data['image_name'])
    if data['image_name'] in tags:
       print(tags)
       print(tags[data['image_name']])
       return jsonify(tags[data['image_name']]) 
    else:
        return jsonify([])

#saving tags for an image. Have to update tags as well as the inverse map
@app.route('/tags', methods=['POST'])
def add_tags():
    print(request.get_json())
    data = request.get_json()
    tags[data['image_name']] = data['tags']

    #TODO deleting tags when resaving

    #TODO save to longterm storage

    for tagOfImage in data['tags']:
        if tagOfImage not in tags_inv:
            tags_inv[tagOfImage] = data['image_name']
        else:
            tmp = tags_inv[tagOfImage]
            tmp.append( data['image_name'] )
            tags_inv[tagOfImage] = tmp
    
    save_file = open(saveDirectory+"/data.pkl", "wb")
    pickle.dump(tags, save_file)
    save_file.close()

    return '', 200
