from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import os.path
import numpy as np
import shutil
import glob
import search
import tagging

app = Flask(__name__)
CORS(app)

#tags -> dictionary: maps file names to an an array of tags
#tags_inv -> dictionary: maps tags to file names (inv for inverse)
#TODO we need the path
tags = {}
tags_inv = {}
saveDirectory = ''


#TODO upload images

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
    return send_file(request.args.get('path',default='', type = str ), mimetype='image/jpg')

#get all the unique tags up to now
@app.route('/get_unique_tags',methods=['GET'])
def get_unique_tags():
    return jsonify([x for x in tags_inv])

#return all the tags for a provided image name
@app.route('/get_tags_for_image',methods=['GET'])
def get_tags():
    image_name = request.args.get('image_name',default='', type = str )
    if image_name in tags:
       return jsonify(tags[image_name]) 
    else:
        return jsonify([])

#saving tags for an image. Have to update tags as well as the inverse map
@app.route('/save_tags_for_image', methods=['POST'])
def add_tags():
    print(request.get_json())
    data = request.get_json()
    tags[data['image_name']] = data['tags']

    source_path = data['source_path']
    destination_path = data['destination_path']

    try:#TODO copy differently
        shutil.copyfile(source_path+"/"+data['image_name'],destination_path+"/"+data["image_name"])
        shutil.copyfile(source_path+"/"+data['image_name'].split('.')[0]+'.CR3',destination_path+"/"+data["image_name"].split(".")[0]+".CR3")
    except:
        print("copy error")
    

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

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#for searching things

image_store = '/media/stan/Extreme SSD/train_picture'

folderToDictionary = {}
tagToImages = {}
filePickle = glob.glob("../site/public/202*")
for dictionary in filePickle:
    base = os.path.basename(dictionary)
    save_file = open(os.path.join(dictionary,"data.pkl"), "rb")

    tags_local = pickle.load(save_file)
    images_to_ignore = []
    for imageFileName in tags_local:
        if 'd' in tags_local[imageFileName]:
            images_to_ignore.append(imageFileName)
    folderToDictionary[base] = tags_local
    for image in images_to_ignore:
        del tags_local[image]

    for imageNameKey in tags_local:
        for tagOfImage in tags_local[imageNameKey]:
            if tagOfImage not in tagToImages:
                tagToImages[tagOfImage] = [ base + "/" + imageNameKey ]
            else:
                tmp = tagToImages[tagOfImage]
                tmp.append( base + "/" + imageNameKey )
                tagToImages[tagOfImage] = tmp#TODO image needs to have path appended as well to distinguish
'''
-- filter by code
-- filter by message
-- filter by unknown
-- filter by img
'''
@app.route('/all_tags_and_frequency',methods=['GET'])
def get_all_tags_and_frequency():
    return jsonify([str(x)+' '+str(tagToImages[x]) for x in tagToImages])

@app.route('/get_all_codes',methods=['GET'])
def get_all_codes():
    return jsonify(search.search_get_all_codes(tagToImages))

@app.route('/get_specific_image_search',methods=['GET'])
def get_specific_image_search():
    return send_file(image_store+'/'+request.args.get('page',default='', type = str ), mimetype='image/jpg')

@app.route('/get_all_images_for_tag',methods=['GET'])
def get_all_images_for_tag():
    return jsonify(search.search_get_all_images_for_tag(request.args.get('page',default='',type=str),tagToImages))

@app.route('/get_specific_tags',methods=['GET'])
def get_specific_tag():
    return jsonify(search.search_get_specific_tag(request.args.get('train',default='',type=str),folderToDictionary))

@app.route('/group_by_similarity',methods=['GET'])
def group_by_similarity():
    return jsonify(search.search_group_by_similarity(tagToImages))
