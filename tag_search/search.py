from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import os.path
import numpy as np
import glob

app = Flask(__name__)
CORS(app)

image_store = '/media/stan/Extreme SSD/train_picture'

folderToDictionary = {}
tagToImages = {}
filePickle = glob.glob("../site/public/202*")
for dictionary in filePickle:
    base = os.path.basename(dictionary)
    save_file = open(os.path.join(dictionary,"data.pkl"), "rb")

    tags = pickle.load(save_file)
    images_to_ignore = []
    for imageFileName in tags:
        if 'd' in tags[imageFileName]:
            images_to_ignore.append(imageFileName)
    folderToDictionary[base] = tags
    for image in images_to_ignore:
        del tags[image]

    for imageNameKey in tags:
        for tagOfImage in tags[imageNameKey]:
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
@app.route('/all_tags_and_frequency',methods=['POST','GET'])
def get_all_tags_and_frequency():
#    return jsonify([str(x)+' '+str(tagToImages[x]) for x in tagToImages])
    return get_all_codes()


@app.route('/all_codes',methods=['GET','POST'])
def get_all_codes():
    arr = []
    for tag in tagToImages:
        if 'code' in tag:
            if len(tagToImages[tag]) > 1:
                arr.append([tag,tagToImages[tag]])
    return jsonify( arr )

@app.route('/get_specific_image',methods=['GET'])
def get_specific_image():
    page = request.args.get('page',default='', type = str )
    return send_file(image_store+'/'+page, mimetype='image/jpg')

#exact search
@app.route('/get_all_images_for_tag',methods=['GET','POST'])
def get_all_images_for_tag():
    page = request.args.get('page',default='',type = str )
    if page in tagToImages:
        return jsonify(tagToImages[page])
    else:
        return jsonify([])
      

#TODO lose search
     

@app.route('/get_specific_tags',methods=['GET','POST'])
def get_specific_tag():
    train = request.args.get('train',default='',type=str)
    if len(train) == 0:
        return jsonify( [] )
    split = train.split("/")
    if len(split) == 2:
        print( folderToDictionary[split[0]][split[1]]  )
        return jsonify( folderToDictionary[split[0]][split[1]] )
    else:
        print('else')
        return jsonify( [] )
    

'''
return current best results for 
'''
