import React, { useState, Component, useEffect} from 'react';
import Draggable, {DraggableCore} from 'react-draggable';
import ReactDOM from 'react-dom';

const url_search_backend='http://127.0.0.1:5001';
var returned = false;

export default function ImageComponent({height,width,path}){
	const [dragState, setDragState] = useState({activeDrags: 0, deltaPosition: { x: 0, y: 0 }, controlledPosition: {x: -400, y: 200  }})
	const onStart = () => { setDragState({activeDrags: ++dragState.activeDrags});};
	const onStop = () => { setDragState({activeDrags: --dragState.activeDrags});};
	const dragHandlers = {onStart: onStart, onStop: onStop};

	const [tagState, setTagState] = useState([])


	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ })
	};
	useEffect( () => {
		fetch(url_search_backend+'/get_specific_tags?train='+path, requestOptions).then(res => res.json()).then(res => setTagState(res));
		returned = true;
	}, []);

	return(
		<div>
			<Draggable {...dragHandlers}>
				<div style={{border:'5px solid black', width:width*0.2}}>
					<details>
						<summary>Title</summary>
						<img src={'http://127.0.0.1:5001/get_specific_image?page=' + path} style={{height:height*0.3}}/>
						{tagState}
					</details>
				</div>
			</Draggable>
		</div>
	)
}
