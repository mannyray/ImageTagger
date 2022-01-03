import React, {Component} from 'react';
import Tag from './Tag';

export default class Upload extends Component {

	constructor(props){
		super(props)
		this.url_backend = this.props.url_backend;
		this.state = {
			height:this.props.height,
			width:this.props.width,
			imageURL:'',
			submit:false,
			images:[],
			dictionary:{}
		};
		this.handleUploadImage = this.handleUploadImage.bind(this);
		this.uploadImageRecursive = this.uploadImageRecursive.bind(this);
	}

	handleUploadImage(e){
		this.uploadImageRecursive(0,this.uploadInput.files);
	}

	uploadImageRecursive(index,files){
		if(index === files.length){
			fetch(this.url_backend+'/images_session?path='+this.save_directory.value, {method: 'GET'} ).then( res => res.json()).then(res => this.setState({images:res,submit:true}));
		}
		else{
			var basename = files[index].name.split('.')[0];
			var ending = files[index].name.split('.')[1];
			if(ending === 'JPG'){
				this.state.images.push([basename+'.'+ending]);
			}
			
			const data = new FormData();
			data.append('file',files[index]);
			fetch(this.url_backend+'/upload?path='+this.save_directory.value, {method: 'POST',body: data } ).then( res => this.uploadImageRecursive(index+1,files));
		}
	}

	render() {
		if( this.state.submit === false ){
			return (
				<div>
					<div>
						<h1>Images for tagging:</h1>
						<input ref={ (ref) => { this.uploadInput = ref;}} type="file" multiple />
					</div>
					<br/>
					<div>
						<h1>Save Directory</h1>
						<input ref={ (ref) => { this.save_directory = ref;} } />
					</div>
					<br/>
					<div>
						<button onClick={this.handleUploadImage}>Upload</button>
					</div>
				</div>
			);
		}
		else{
			return (
				<div>
					 <Tag url_backend={this.url_backend} save_directory={this.save_directory.value} height={this.state.height} width={this.state.width} firstImage={this.state.images[0]} images={this.state.images} />
				</div>
			);
		}
	}
}
