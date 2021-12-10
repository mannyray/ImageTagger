import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import ImageComponent from './ImageComponent';

const url_search_backend='http://127.0.0.1:5001';
var string = '';


export default function Search({height,width}){
	const [searchTags, setSearchTags] = useState([]);
	const [value, setValue] = useState('');
	const [trainsSearch, setTrainsSearch] = useState([]);

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ })
	};

	var trainImagesUp = [];

	function removeImage(name){
		/*var tags = searchTags;
		for(var i=0; i < tags.length; i++){
			if(name === searchTags[i]){
				tags.splice(i,1);
				continue;	
			}
		}
		for(var i=0; i<tags.length; i++){
			trainImagesUp.push(<ImageComponent height={height} width={width} path={tags[i]} closeFunction={removeImage} />);
		}
		setTrainsSearch(tags);*/
	}

	function LoadAllTags(data){
		console.log('here');
		console.log(string)
		setSearchTags(data);
		trainImagesUp = [];
		for(var i=0; i<data.length; i++){
			trainImagesUp.push(<ImageComponent height={height} width={width} path={data[i]} closeFunction={removeImage} />);
		}
		setTrainsSearch(trainImagesUp);
	}

	const handler = (event) => {
		if(event.key === 'Enter'){
			var searchString = string.replace(" ","%20");
			fetch(url_search_backend+'/get_all_images_for_tag?page='+searchString, requestOptions).then(res => res.json()).then(res => LoadAllTags(res));
		}
		else{
			if(event.key === '='){
				string = '';
			}
			else{
				string = string + event.key;
			}
			setValue(string);
		}
	}

	//include previous search history too
	return (
		<div>
			<h1>Search page</h1>
			<input type="text"  value={value}  onKeyPress={(e) => handler(e)}  autofocus="autofocus" />
			{trainsSearch}
		</div>
	);
}
