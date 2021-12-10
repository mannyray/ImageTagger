import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import ImageComponent from './ImageComponent';


const url_search_backend='http://127.0.0.1:5001';

export default class Search extends Component {

	constructor(props){
		super(props)
		this.width = this.props.width;
		this.height = this.props.height;
		this.state = {value:'',searchTags:[],trainsSearch:[]};

		this.handler = (event) => {
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ })
			};
			if(event.key === 'Enter'){
				this.setState({trainsSearch:[]});
				var searchString = this.state.value.replace(" ","%20");
				fetch(url_search_backend+'/get_all_images_for_tag?page='+searchString, requestOptions).then(res => res.json()).then(res => this.LoadAllTags(res));
			}
			else{
				if(event.key === '='){
					this.setState({value: ''});
				}
				else{
					this.setState({value:this.state.value + event.key});
				}
			}
		}
	}

	pinImage(name){
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

	LoadAllTags(data){
		var trainImagesUp = [];
		this.setState({searchTags:data});
		trainImagesUp = [];
		for(var i=0; i<data.length; i++){
			trainImagesUp.push(<ImageComponent height={this.height} width={this.width} path={data[i]} pinFunction={this.pinImage} color='red' />);
		}
		this.setState({trainsSearch:trainImagesUp});
		console.log(trainImagesUp);
	}


	//include previous search history too
	render() {
		return (
			<div>
				<h1>Search page</h1>
				<input type="text"  value={this.state.value}  onKeyPress={(e) => this.handler(e)}  autofocus="autofocus" />
				{this.state.trainsSearch}
			</div>
		);
	}
}
