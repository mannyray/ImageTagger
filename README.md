# ImageTagger

In this repository I implement a locally hosted in-browser tool built using React and Flask that helps sort pictures. Consider the following scenario:

### Scenario:

On a regular basis you are taking lots of high resolution pictures and need a way to sort them. The pictures all have a particular theme to them and you are looking to organize them and search through them as you collect more and more. In this repository we will pretend we are coin enthusiasts and every day we are taking a bunch of coin pictures. These coins are in `test_images` directory directory with each day containing some take pictures (`day_1`, `day_2` and `day_3`).

The coins have
 - A type (Loonie, Twonie, Quarter, Nickel, Dime)
 - The year of minting
 - Other interesting features like rust or scratches
 - Specials coin (e.g. a coin minted for celebrating some holiday)

Here is a sample image:

![](test_images/day_1/PXL_20211116_004425903.jpg)

You may say this coin is
 - A Quarter
 - From 2021
 - Not interesting and should be deleted

With another coin:

![](test_images/day_1/INTERESTING_IMAGE.jpg)

You may say this coin is
 - A TODO get privince coin 
 - From
 - Very interesting. A coin about a Canadian `province` `Manitoba`.

As you process your images, you want to tag these features for easier searching later on. The quarter above can be tagged with `YEAR`, `quarter`, `province`, `manitoba`. Tagging must be easy and idealy mouse free in order to avoid caprul tunnel. In addition, to determine all of the qaualities you may need to easily zoom in on the coin to add all apropriate tags.

Once you processed an image and decided you want to keep it you save it.

Say on `day_N` you find another quarter captured below:

![](test_images/day_1/INTERESTING_IMAGE.jpg)

You tag this image `YEAR`, `quarter`, `province`, `ontario`. You recall that you already have encountered a `manitoba` coin before and want to search for it and view the coins side by side. You want to find all `province` coins to see if you got all 10 provinces covered yet through all your days of taking pictures of coins. You search by `quarter` and `province` and see all the images loaded up. Since each original image was high resolution, a lower resolution image is loaded up.

 
### Solution:

To see how this scenario is handled by the code here, let's load up the app. To load the front end:

```
cd site
npm start
```

To load the backend, in new terminal

```
cd tag_store
export FLASK_APP=hello
flask run
```

 
Backend:
 - ~~rename hello.py and improperly methods within~~
 - ~~Update folder names~~

separate page to modify backend

Setup page:
 - ~~page where you specify source and destination. Destination is long term storage~~

Front end:
 - ~~Make image take up entire screen~~
 - ~~Have a zoom feature that does not depend on full screen size~~
 - ~~Hyper link to see full size image(don't need that as current zoom feature good enough)~~
 - ~~set variable for 127.0.0.1:5000~~
   -- ~~create single source for url in all code~~
 - ~~tab out code~~
 - ~~Place tagging search bar in a better place~~
 - ~~basic on screen instructions including tagging guide lines~~
 - Create a scroll bar to get to next images faster
 - ~~Ability to upload pictures upon 'saving' to backend along with its tags~~
 - ~~New page (through new path): for searching through tags~~
   * ~~images should have an ID -> folder plus image name~~
   * ~~search images should be zoomable~~
   * ~~Search bar for tags~~
   * ~~Search results should have images too along with their tags~~
   * ~~combine search flask backend python code with tagging backend~~
   * Search bar with autofill feature and ability to copy paste
   * **way to search so that it is not exact search**
   * ~~Save some images to a 'hot' list~~
   * show search history
   * ~~Load images that pop up that are searched for (make sure we don't overwhelm backend)~~
   * Allow ability to view resultant image in new tab full resolution 
   * **When pinning make it so that order is not changed or position in screen**
 - **New page for editings tags**


Code cleanup:
 - remove references to train
 - **clear up POST/GET requests**
 - **add documentation**
 - **split and organize and modularize the code in tag.py**
 - **have a separate wrapper for reading from the database/file**
 - **upload pictures through flask**  
