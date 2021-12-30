import re

def search_group_by_similarity(tagToImages):

    res = []
    for tag in tagToImages:
        if 'text ' not in tag and 'tag ' not in tag:
            continue
        for tag2 in tagToImages:#TODO fix this
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
    return res


def search_get_specific_tag(train,folderToDictionary):
    if len(train) == 0:
        return []
    split = train.split("/")
    if len(split) == 2:
        return folderToDictionary[split[0]][split[1]] 
    else:
        return []


def search_get_all_images_for_tag(page,tagToImages):
    if page in tagToImages:
        return tagToImages[page]
    else:
        return []


def search_get_all_codes(tagToImages):
    arr = []
    for tag in tagToImages:
        if 'code' in tag:
            if len(tagToImages[tag]) > 1:
                arr.append([tag,tagToImages[tag]])
    return arr 

