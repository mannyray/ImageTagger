from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import os.path
import numpy as np
import shutil
import glob
import re

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

    source_path = data['source_path']
    destination_path = data['destination_path']

    try:
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
@app.route('/all_tags_and_frequency',methods=['POST','GET'])
def get_all_tags_and_frequency():
    return jsonify([str(x)+' '+str(tagToImages[x]) for x in tagToImages])
#    return get_all_codes()


@app.route('/all_codes',methods=['GET','POST'])
def get_all_codes():
    arr = []
    for tag in tagToImages:
        if 'code' in tag:
            if len(tagToImages[tag]) > 1:
                arr.append([tag,tagToImages[tag]])
    return jsonify( arr )

@app.route('/get_specific_image_search',methods=['GET'])
def get_specific_image_search():
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


@app.route('/group_by_similarity',methods=['GET','POST'])
def group_by_similarity():
    res = []

    search_data = []
    for tag in tagToImages:
        if 'text ' not in tag and 'tag ' not in tag:
            continue
        for tag2 in tagToImages:
            if 'text ' not in tag2 and 'tag ' not in tag2:
                continue
            if ')' in tag: #H2) == H20
                continue
            if '(' in tag:#message painting with that *(
                continue
            if tag == tag2:
                continue

            tagFilter = re.sub(r"text ","",re.sub(r"tag ","",re.sub(r"\*",r"\.", re.sub(r"(\W)\1+",r"\1",tag))))
            tagFilter2 = re.sub(r"text ","",re.sub(r"tag ","",re.sub( r"\*",r"\.\*",tag2)))
            try:
                x = re.search(tagFilter, tagFilter2)
            except:
                print("ERROR")
                print(tag + " " + tag2)
                t = 0/0
            if x:
                print(tag + " " + tag2)

    return jsonify(res)

'''
return current best results for
'''
