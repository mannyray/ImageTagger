import React, { useState, Component, useEffect} from 'react';
import {TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';
import configuration from "./config.json";

const loadedData = JSON.stringify(configuration);
const json = JSON.parse(loadedData);
const colour_coding = json['colour_coding'];


var combos = ["'n'+'Enter'","'b'+'Enter'","'s'+'Enter'","'d'+'Enter'","'='"];
var combos_action = ["Go to next image","Go to previous image.","Save image to database.","Delete the image.","Clear current info in bar"];

export default class Tag extends Component {

	constructor(props){
		super(props)
		var instructions_items = [];
		for(var i=0; i<combos.length; i++){
			instructions_items.push(<tr><td style={{border:'1px solid'}}>{combos[i]}</td><td style={{border:'1px solid'}}>{combos_action[i]}</td></tr>);
		}

		var colour_instructions = [];
		for(var i=0; i<colour_coding.length; i++){
			colour_instructions.push(<tr><td style={{backgroundColor:colour_coding[i]['colour']}}>{colour_coding[i]['start_word']}</td></tr>);
		}

		this.url_backend = this.props.url_backend;

		this.state = {
			images: this.props.images,
			instructions:instructions_items,
			colorIfDeleted:'black',
			image_viewed:this.props.firstImage,
			height:this.props.height,
			index:0,
			imageCount:this.props.images.length,
			width:this.props.width,
			items:[],
			value:'',
			colourInstructions: colour_instructions,
			tags:[],
			tagsHTML:[],
			save_directory:this.props.save_directory
		};
		this.handler = this.handler.bind(this);
		this.handleCross = this.handleCross.bind(this);
		this.updateTag = this.updateTags.bind(this);

		fetch(this.url_backend+'/get_tags_for_image?image_name='+this.props.firstImage[0]).then(res => res.json()).then(res => this.updateTags(res));
	}

	handler(event){
		if(event.key === 'Enter'){
			if(this.state.value === 's'){
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json'},
					body: JSON.stringify({ image_name:this.state.image_viewed[0],tags:this.state.tags})
				};
				fetch(this.url_backend+'/save_tags_for_image', requestOptions);
				this.updateTags([]);
				this.state.value = 'n';
			}
			if(this.state.value === 'd'){
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image_name:this.state.image_viewed[0],tags:['d'] })
				};
				fetch(this.url_backend+'/save_tags_for_image', requestOptions);
				this.state.value = 'n';
				this.updateTags([]);
			}
			if(this.state.value === 'n' || this.state.value === 'b'){
				if(this.state.value === 'n'){
					this.state.index = this.state.index + 1;
					if(this.state.index === this.state.imageCount){
						this.state.index = 0;
					}
				}
				else{
					this.state.index = this.state.index - 1;
					if(this.state.index === -1 ){
						this.state.index = this.state.imageCount -1;
					}
				}
				var selected_image = [];
				selected_image = this.state.images[this.state.index];
				this.setState({image_viewed:selected_image});
				fetch(this.url_backend+'/get_tags_for_image?image_name='+selected_image[0]).then(res => res.json()).then(res => this.updateTags(res));
			}
			else{
				var arrs = this.state.tags;
				arrs.push(this.state.value);
				this.setState({tags:arrs});
			}
			this.setState({value:''})
			this.updateTags(this.state.tags);
		}
		else if(event.key === '='){
			if(this.state.value !== ''){
				this.setState({value:''});
			}
		}
		else{
			this.state.value = this.state.value + event.key;
			this.setState({value:this.state.value});
		}
	}

	updateTags(tagUpdate){
		this.setState({tags:tagUpdate});
		this.handleCross('');
	}

	handleCross(e){
		var arr = this.state.tags.filter(function(item) {
			return item !== e;
		})
		this.state.tags = arr;
		
		var htmlOut = []
		var delExists = false;
		for(const item of this.state.tags){
			if(item === 'd'){
				delExists = true;
			}
			var specialTag = false;
			for(const coding in colour_coding){
				const code = colour_coding[coding];
				if( item.startsWith(code['start_word'])){
					htmlOut.push(<li class='regular' style={{backgroundColor:code['colour']}}>{item}<span class='close' onClick={() => this.handleCross(item)}>x</span></li>)
					specialTag = true;
					break;
				}
				if( item === 'd' ){
					specialTag = true;
					delExists = true;
					htmlOut.push(<li class='regular' style={{backgroundColor:'red'}}>{item}<span class='close' onClick={() => this.handleCross(item)}>x</span></li>)
					break;
				}
			}
			if( specialTag === false ){
				htmlOut.push(<li class='regular' style={{backgroundColor:"#f6f6f6"}}>{item}<span class='close' onClick={() => this.handleCross(item)}>x</span></li>)
			}
		}
		if(delExists){
			this.setState({colorIfDeleted:'red',tagsHTML:htmlOut});
		}
		else{
			this.setState({colorIfDeleted:'black',tagsHTML:htmlOut});
		}

	}

	render() {
		return (
			<div style={{float:'left',color:this.state.colorIfDeleted}}>
				<div>
					<div style={{ float:'left', display:'flex' }} class="container">
						<TransformWrapper>
							<TransformComponent>
								<img src={this.url_backend+'/get_specific_image_search?page='+this.state.save_directory+'/'+ this.state.image_viewed[0]} style={{height:this.state.height*0.7}} alt="test" />
							</TransformComponent>
						</TransformWrapper>
						<div style={{ float:'left'  }}>
							<h1>Image: {this.state.image_viewed[0]}</h1>
							<h1>Progress: {this.state.index+1}/{this.state.imageCount}</h1>
						</div>
						<div style={{width:'10px'}}></div>
							<div style={{width:this.state.width*0.15}}>
							<h1>Tags:</h1>
							<ul>
								{this.state.tagsHTML}
							</ul>
						</div>
					</div>
				</div>

				<div style={{float:'left',display:'flex'}}>
					<div>
						<h1>Enter Tag:</h1>
						<input type="text"  value={this.state.value}  onKeyPress={(e) => this.handler(e)}  autofocus="autofocus" />
					</div>
					<table style={{border:'1px solid'}}>
						<tr style={{border:'1px solid'}}>
							<td style={{border:'1px solid'}}><b>Reserved Combos</b></td>
							<td style={{border:'1px solid'}}><b>Action</b></td>
						</tr>
						{this.state.instructions}
					</table>
					<div>
						<table style={{border:'1px solid'}}>
							<tr style={{border:'1px solid'}}>
								<td style={{border:'1px solid'}}><b>Reserved Starting Words</b></td>
							</tr>
							{this.state.colourInstructions}
						</table>
					</div>
				</div>
			</div>
		);
	}
}
