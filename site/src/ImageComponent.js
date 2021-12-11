import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';

const url_search_backend='http://127.0.0.1:5001';

export default function ImageComponent({height,width,path,pinFunction,color}){
	const [dragState, setDragState] = useState({activeDrags: 0, deltaPosition: { x: 0, y: 0 }, controlledPosition: {x: -400, y: 200  }})
	const onStart = () => { setDragState({activeDrags: ++dragState.activeDrags});};
	const onStop = () => { setDragState({activeDrags: --dragState.activeDrags});};
	const dragHandlers = {onStart: onStart, onStop: onStop};

	const [tagState, setTagState] = useState([]);
	const [tagButtons, setTagButtons] = useState([]);
	const [title, setTitle] = useState('');
	const [visibilityStatus, setVisibilityStatus] = useState(['visible','nonce']);


	function close(name){
		setVisibilityStatus(['hidden','none']);
	}

	function pin(){
		pinFunction(path);
	}

	function onLoadedTags( data ){
		var buttons = [];
		setTagState(data);
		var foundCode = false;
		for(var i=0; i<data.length; i++){
			if( data[i].length > 4 && data[i].substring(0,4) === 'code' ){
				setTitle(data[i]);
				foundCode = true;
			}
			else{
				buttons.push(<button class="button">{data[i]}</button>);
			}
		}
		setTagButtons(buttons);
		if(foundCode===true){
			return;
		}
		setTitle('unknown');
	}

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ })
	};
	useEffect( () => {
		fetch(url_search_backend+'/get_specific_tags?train='+path, requestOptions).then(res => res.json()).then(res => onLoadedTags(res) );
	}, []);

	return(
		<div>
			<Draggable {...dragHandlers}>
				<div style={{border:'5px solid black', backgroundColor:color, width:width*0.2, visibility:visibilityStatus[0], display:visibilityStatus[1] }}>
					<details>
						<summary>
							{title}
							<div style={{display:'flex'}}>
								<div>
									{tagButtons}
								</div>
								<div style={{marginLeft:'auto',marginRight:0}}>
									<button onClick={close}>X</button>
									<button onClick={pin}>PIN</button>
								</div>
							</div>
						</summary>
						<img src={'http://127.0.0.1:5001/get_specific_image?page=' + path} style={{width:width*0.196}}/>
					</details>
				</div>
			</Draggable>
		</div>
	)
}
