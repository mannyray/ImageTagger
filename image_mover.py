import glob, os
import pickle
import shutil
from datetime import datetime

date_time = datetime.now().strftime("%d_%m_%Y")
if not os.path.exists('site/public/'+date_time):
    os.makedirs('site/public/'+date_time)

tags = {}
if os.path.exists('tag_store/data.pkl'):
    save_file = open("tag_store/data.pkl", "rb")
    tags = pickle.load(save_file)
    shutil.move("tag_store/data.pkl", "site/public/"+date_time+"/data.pkl")

if not os.path.exists('site/public/deleted'):
    os.makedirs('site/public/deleted')


for file in os.listdir("site/public"):
    if file in tags:
        root = file[0:file.index('.')]
        if 'd' in tags[file]:
            try:
                shutil.move("site/public/"+root+".JPG", "site/public/deleted/"+root+".JPG")
                shutil.move("site/public/"+root+".CR3", "site/public/deleted/"+root+".CR3")
            except:
                print('failed moving '+str(file)+' to deleted')
        else:
            try:
                shutil.move("site/public/"+root+".JPG", "site/public/"+date_time+"/"+root+".JPG")
                shutil.move("site/public/"+root+".CR3", "site/public/"+date_time+"/"+root+".CR3")
            except:
                print('failed moving '+str(file)+' to deleted')
