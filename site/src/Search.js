import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import ImageComponent from './ImageComponent';

const url_search_backend='http://127.0.0.1:5001';
var returned = false;
var firstLoadSearch = false;
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

	function loadAllTags(data){
		firstLoadSearch = true;
		setSearchTags(data);
		trainImagesUp = [];
		for(var i=0; i<data.length; i++){
			trainImagesUp.push(<ImageComponent height={height} width={width} path={data[i]} />);
		}
		setTrainsSearch(trainImagesUp);
	}


	const handler = (event) => {
		if(event.key === 'Enter'){
			var searchString = string.replace(" ","%20");
			fetch(url_search_backend+'/get_all_images_for_tag?page='+searchString, requestOptions).then(res => res.json()).then(res => loadAllTags(res));
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
	)
}
