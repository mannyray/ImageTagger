import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import ImageComponent from './ImageComponent';


const url_search_backend='http://127.0.0.1:5001';
var globalSearchTags = [];

export default class Search extends Component {

	constructor(props){
		super(props)
		this.width = this.props.width;
		this.height = this.props.height;
		this.state = {value:'',searchTags:[],trainsSearch:[],pinnedSearch:[]};

		this.pinImage = this.pinImage.bind(this);
		this.LoadAllTags = this.LoadAllTags.bind(this);

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
		const index = this.state.searchTags.indexOf(name);
		const indexInPinned = this.state.pinnedSearch.indexOf(name);
		if(index === -1){
			if( indexInPinned !== -1 ){
				this.state.pinnedSearch.splice(indexInPinned,1);
				var arr = this.state.searchTags;
				arr.push(name);
				this.setState({searchTags:arr});
				this.setState({pinnedSearch:this.state.pinnedSearch});
			}
		}
		else{
			this.state.searchTags.splice(index,1);
			var arr = this.state.pinnedSearch;
			arr.push(name);
			this.setState({searchTags:this.state.searchTags});
			this.setState({pinnedSearch:arr});
		}
		this.LoadAllTags(this.state.searchTags);
	}

	LoadAllTags(data){
		var trainImagesUp = [];
		this.setState({searchTags:data});
		globalSearchTags = this.state.searchTags;
		trainImagesUp = [];
		for(var i=0; i<data.length; i++){
			trainImagesUp.push(<ImageComponent height={this.height} width={this.width} path={data[i]} pinFunction={this.pinImage} color='white' />);
		}
		for(var i=0; i<this.state.pinnedSearch.length; i++){
			trainImagesUp.push(<ImageComponent height={this.height} width={this.width} path={this.state.pinnedSearch[i]} pinFunction={this.pinImage} color='red' />);
		}
		this.setState({trainsSearch:trainImagesUp});
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
