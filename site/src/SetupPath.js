import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import Tag from './Tag';

const url_search = 'http://127.0.0.1:5000';
var globalSearchTags = [];

export default class SetupPath extends Component {

	constructor(props){
		super(props)
		this.height = this.props.height;
		this.width = this.props.width;
		this.state = {sourcePath:'',destinationPath:'',submit:false,images:[]};
		this.handleSubmission = this.handleSubmission.bind(this)
		this.url_backend = this.props.url_backend;
	}

	handleSubmission(event){
		fetch(url_search+'/get_images_in_directory_and_set_path?directory='
			+this.state.sourcePath.replace(' ','%20')+'&save_directory='+this.state.destinationPath.replace(' ','%20'))
			.then(res => res.json())
			.then(res => this.setState({images:res,submit:true}));
	}

	render() {
		if(this.state.submit === false){
			return (
				<div>
					<h1>Source Path</h1>
					<input type="text" onChange={(e) => this.setState({sourcePath:e.target.value})} value={this.state.sourcePath}/>
					<h1>Destination Path</h1>
					<input type="text" onChange={(e) => this.setState({destinationPath:e.target.value })} value={this.state.destinationPath}/>
					<button onClick={this.handleSubmission}>Submit</button>
				</div>
			);
		}
		else{
			return (
				<div>
					<Tag url_backend={this.url_backend} height={this.height} width={this.width} firstImage={this.state.images[0]} images={this.state.images} sourcePath={this.state.sourcePath} destinationPath={this.state.destinationPath}  />
				</div>
			);
		}
	}
}
