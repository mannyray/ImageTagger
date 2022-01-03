import glob
import os
import pickle
import shutil
from werkzeug.utils import secure_filename
from flask import send_file

image_store = '/media/stan/Extreme SSD/train_picture'

folderToDictionary = {}
tagToImages = {}

#loads a pkl file
def processPKL(path,base):
    save_file = open(path,"rb")
    tags = pickle.load(save_file)

    #'d' is key word for deleted image 
    #we do not bother loading up the deleted images
    #also move folders to a deleted folder for archive purposes
    images_to_ignore = []
    for imageFileName in tags:
        if 'd' in tags[imageFileName]:
            images_to_ignore.append(imageFileName)
    for image in images_to_ignore:
        del tags[image]
        delete_folder = os.path.join(image_store,base,'delete')
        if not os.path.isdir(delete_folder):
            os.mkdir(delete_folder)
        deleted_files = glob.glob(os.path.join(image_store,base,image.split('.')[0]+'*'))
        for d in deleted_files:
            shutil.move(d,os.path.join(image_store,base,'delete',os.path.basename(d)))

    tagToImages = {}
    for imageNameKey in tags:
        for tagOfImage in tags[imageNameKey]:
            if tagOfImage not in tagToImages:
                tagToImages[tagOfImage] = [ imageNameKey ]
            else:
                tmp = tagToImages[tagOfImage]
                tmp.append( imageNameKey )
                tagToImages[tagOfImage] = tmp
    return tags, tagToImages
    
def appendToDictionaryValues(value,dictionary):
    for key in dictionary:
        arr = dictionary[key]
        new_arr = []
        for a in arr:
            new_arr.append(value+a)
        dictionary[key] = new_arr
    return dictionary

def uniteDictionary(dictionary1, dictionary2):
    for key in dictionary1:
        if key in dictionary2:
            arr = dictionary1[key] + dictionary2[key]
            dictionary1[key] = arr
    for key in dictionary2:
        if key not in dictionary1:
            dictionary1[key] = dictionary2[key]
    return dictionary1



folder_to_image_to_tags = {}
tagToImages = {}

folders = glob.glob(os.path.join(image_store,"*"))
for folder in folders:
    base = os.path.basename(folder)
    if os.path.exists(os.path.join(folder,'data.pkl')):
        res = processPKL(os.path.join(folder,'data.pkl'),base)

    tags_of_folder = res[0]
    folder_to_image_to_tags[base] = tags_of_folder

    tagToImages_of_folder = res[1]
    tagToImages_of_folder = appendToDictionaryValues(base+"/",tagToImages_of_folder)
    tagToImages = uniteDictionary(tagToImages,tagToImages_of_folder)

def upload(current_session_path,file):
    target=os.path.join(image_store,current_session_path)
    if not os.path.isdir(target):
        os.mkdir(target)
    filename = secure_filename(file.filename)
    destination="/".join([target,filename])
    file.save(destination)

def get_tags(current_session_path,image_name):
    if current_session_path in folder_to_image_to_tags:
        if image_name in folder_to_image_to_tags[current_session_path]:
            return folder_to_image_to_tags[current_session_path][image_name]
    return []

def initialize(current_session_path):
    target = os.path.join(image_store,current_session_path)
    if not os.path.isdir(target):
        os.mkdir(target)
        folder_to_image_to_tags[current_sesion_path] = {}

def get_files(current_session_path):
    initialize(current_session_path)
    files = glob.glob(os.path.join(image_store,current_session_path,'*.JPG'))
    files = [ [os.path.basename(x)] for x in files]
    return files

def save_tags(current_session_path,image_name,tags):
    initialize(current_session_path)
    folder_to_image_to_tags[current_session_path][image_name] = tags
    save_file = open(os.path.join(image_store,current_session_path,"data.pkl"), "wb")
    pickle.dump(folder_to_image_to_tags[current_session_path], save_file)
    save_file.close()

    #TODO update the inverse

def get_image(current_session_path,image_name):
    print('name:'+ image_name)
    return send_file(os.path.join(image_store,current_session_path,image_name), mimetype='image/jpg')
