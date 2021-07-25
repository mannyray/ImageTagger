import React, { useState } from 'react';
import { Image } from "react-native";

var string = '';
var index = 0;
var images = [];


var first_image = '';
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

images = importAll(require.context('../public', false, /\.(JPG)$/));
var image_length = 0;
for(var img in images){
	image_length = image_length + 1;
}
for( img in images){
	first_image = img;
	break;
}

var requestOptions = {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ image_name:first_image })
    };
var first_tags = fetch('http://127.0.0.1:5000/tag_for_image', requestOptions).then(res => res.json()).then(res => console.log(res));

const App = () => {
  const [state, setState] = useState('');
  const [value, setValue] = useState('');
  const [tags, setTags] = useState([]);
  const [uniqueTags, setUniqueTags] = useState([]);
  const [image_viewed, setImage_viewed] = useState(first_image);

  const handler = (event) => {
    if(event.key === 'Enter'){
	if(string === 'save'){
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ image_name:image_viewed,tags:tags })
		    };
	    fetch('http://127.0.0.1:5000/tags', requestOptions);
	    setTags([]);
	    setState('');
	}
	if(string === 'n'){
		index = index + 1;
		if(index === image_length){
			index = 0;
		}
		var local_index = 0;
		var selected_image = ''; 
		for(var img in images){
			selected_image = img;
			if(local_index === index){
				break;
			}
			local_index = local_index + 1;
		}
		setImage_viewed(selected_image);

		requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ image_name:selected_image })
		};
		fetch('http://127.0.0.1:5000/tag_for_image', requestOptions).then(res => res.json()).then(res => setTags(res));
		setState('');


		var requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ })
		};
		fetch('http://127.0.0.1:5000/get_unique_tags', requestOptions).then(res => res.json()).then(res => setUniqueTags(res))
	}
	if(string === 'b'){
		index = index - 1;
		if(index === -1 ){
			index = image_length -1;
		}
		var local_index = 0;
		selected_image = ''; 
		for(var img in images){
			selected_image = img;
			if(local_index === index){
				break;
			}
			local_index = local_index + 1;
		}
		setImage_viewed(selected_image);

		requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ image_name:selected_image })
		};
		fetch('http://127.0.0.1:5000/tag_for_image', requestOptions).then(res => res.json()).then(res => setTags(res));
		setState('');

		var requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ })
		};
		fetch('http://127.0.0.1:5000/get_unique_tags', requestOptions).then(res => res.json()).then(res => setUniqueTags(res))
	}
	else{
		var arrs = tags;
		arrs.push(string);
		setTags(tags);
		setState(string);
	}
	setValue('');
	string = '';
    }
    else if(event.key === '='){
	if(string !== ''){
		string = ''
		setValue(string)
	}
   }	
   else{
	string = string + event.key
	setValue(string)
    }
  };

	function handleCross(e){
		var arr = tags.filter(function(item) {
		    return item !== e
		})
		setTags(arr)
		setState('')
	}

	var delExists = false;
	const items = []
	for(const item of tags){
		if(item === 'd'){
			delExists = true;
			items.push(<li class='red'>{item}<span class='close' onClick={() => handleCross(item)}>x</span></li>)
		}
		else{
			items.push(<li class='regular'>{item}<span class='close' onClick={() => handleCross(item)}>x</span></li>)
		}
	}


	const visualTagsItems = []
	for(const item of uniqueTags){
		visualTagsItems.push(<option value={item}>{item}</option>)
	}



  if(delExists){ 
	  return (
	    <div style={{color: "red"}}>
		  <select name="cars" id="cars">
		  {visualTagsItems}
		  </select>
	      <h1>Image sorter</h1>
		  <Image
		    source={{uri: process.env.PUBLIC_URL + '/'+image_viewed}}
		    style={{ width: 1800, height: 1000   }}
		    resizeMode="contain"
		   />
		<p>Last tag: {state}</p>
		<input type="text" value={value}  onKeyPress={(e) => handler(e)}  autofocus="autofocus" />
		<div>
			<h2>Tags:</h2>
			<ul>
			{items}
			</ul>
		</div>
	    </div>
	  );
  }
  else{
	  return (
	    <div>
		  <select name="cars" id="cars">
		  {visualTagsItems}
		  </select>
	      <div style={{ float:'left' }}>
	      <h1>Image sorter</h1>
		  <Image
		    source={{uri: process.env.PUBLIC_URL + '/'+image_viewed}}
		    style={{ width: 1500, height: 1000 }}
		    resizeMode="contain"
		   />
		<p>Last tag: {state}</p>
		<input type="text" value={value}  onKeyPress={(e) => handler(e)}  autofocus="autofocus" />
		</div>
		<div style={{ float:'right',width:'1600px'  }}>
			<h2>Tags:</h2>
			<ul>
			{items}
			</ul>
		</div>
	    </div>
	  );
  }
};
  
export default App;
