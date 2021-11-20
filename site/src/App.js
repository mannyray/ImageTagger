import React, { useState } from 'react';
import { Component } from 'react';
import {TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Image, Dimensions } from 'react-native';
import  useWindowDimensions from './windows.js';
import configuration from "./config.json";

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
const url_backend='http://127.0.0.1:5000';

var image_length = 0;
for(var img in images){
	image_length = image_length + 1;
}
var image_index = 0;
for( img in images){
	first_image = img;
	break;
}

var combos = ["'n'+'Enter'","'b'+'Enter'","'s'+'Enter'","'d'+'Enter'","'='"];
var combos_action = ["Go to next image","Go to previous image.","Save image to database.","Delete the image.","Clear current info in bar"];

const loadedData = JSON.stringify(configuration);
const json = JSON.parse(loadedData);
const colour_coding = json['colour_coding'];

const App = () => {
	const [state, setState] = useState('');
	const [value, setValue] = useState('');
	const [tags, setTags] = useState([]);
	const [uniqueTags, setUniqueTags] = useState([]);
	const [image_viewed, setImage_viewed] = useState(first_image);
	const { height, width } = useWindowDimensions();

	const handler = (event) => {
		if(event.key === 'Enter'){
			if(string === 's'){
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image_name:image_viewed,tags:tags })
				};
				fetch(url_backend+'/tags', requestOptions);
				setTags([]);
				setState('');
				string = 'n';
			}
			if(string === 'd'){
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image_name:image_viewed,tags:['d'] })
				};
				fetch(url_backend+'/tags', requestOptions);
				setTags([]);
				setState('');
				string = 'n';
			}
			if(string === 'n' || string === 'b'){
				if(string === 'n'){
					index = index + 1;
					if(index === image_length){
						index = 0;
					}
				}
				else{
					index = index - 1;
					if(index === -1 ){
						index = image_length -1;
					}
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
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image_name:selected_image })
				};
				fetch(url_backend+'/tag_for_image', requestOptions).then(res => res.json()).then(res => setTags(res));
				setState('');
			}
			else{
				console.log("ddd");
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
			console.log(item);
			var specialTag = false;
			for(const coding in colour_coding){
				const code = colour_coding[coding];
				if( item.startsWith(code['start_word'])){
					items.push(<li class='regular' style={{backgroundColor:code['colour']}}>{item}<span class='close' onClick={() => handleCross(item)}>x</span></li>)
					specialTag = true;
					break;
				}
			}
			if( specialTag === false ){
				items.push(<li class='regular' style={{backgroundColor:"#f6f6f6"}}>{item}<span class='close' onClick={() => handleCross(item)}>x</span></li>)
			}
		}

	}

	var instructions_items = [];
	for(var i=0; i<combos.length; i++){
		instructions_items.push(<tr><td style={{border:'1px solid'}}>{combos[i]}</td><td style={{border:'1px solid'}}>{combos_action[i]}</td></tr>);
	}

	var colour_instructions = [];
	for(var i=0; i<colour_coding.length; i++){
		colour_instructions.push(<tr><td style={{backgroundColor:colour_coding[i]['colour']}}>{colour_coding[i]['start_word']}</td></tr>);
	}

	var colorIfDeleted = 'black';
		if(delExists){
		colorIfDeleted = 'red';
	}

	return (
		<div style={{float:'left',color:colorIfDeleted}}>
			<div>
				<div style={{ float:'left', display:'flex' }} class="container">
					<TransformWrapper>
						<TransformComponent>
							<img src={image_viewed} style={{height:height*0.7}} alt="test" />
						</TransformComponent>
					</TransformWrapper>
					<div style={{ float:'left'  }}>
						<h1>Image: {image_viewed}</h1>
						<h1>Progress: {index+1}/{image_length}</h1>
						<h1>Image Path:</h1>
						<input type="text" style={{width:'300px'}}/>
						<h1>Save folder:</h1>
						<input type="text" style={{width:'300px'}}/>
					</div>
					<div style={{width:'10px'}}></div>
					<div style={{width:width*0.15}}>
						<h1>Tags:</h1>
						<ul>
							{items}
						</ul>
					</div>
				</div>
			</div>
			<div style={{float:'left',display:'flex'}}>
				<div>
					<h1>Enter Tag:</h1>
					<input type="text"  value={value}  onKeyPress={(e) => handler(e)}  autofocus="autofocus" />
				</div>
				<table style={{border:'1px solid'}}>
					<tr style={{border:'1px solid'}}>
						<td style={{border:'1px solid'}}><b>Reserved Combos</b></td>
						<td style={{border:'1px solid'}}><b>Action</b></td>
					</tr>
					{instructions_items}
				</table>
				<div>
					<table style={{border:'1px solid'}}>
						<tr style={{border:'1px solid'}}>
							<td style={{border:'1px solid'}}><b>Reserved Starting Words</b></td>
						</tr>
						{colour_instructions}
					</table>
				</div>
			</div>
		</div>
	);
};
export default App;
