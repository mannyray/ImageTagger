import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Component } from 'react';
import {TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Image, Dimensions } from 'react-native';
import  useWindowDimensions from './windows.js';
import ReactDOM from 'react-dom';
import configuration from "./config.json";
import Search from './Search';
import SetupPath from './SetupPath';

const url_backend='http://127.0.0.1:5000';

const App = () => {
	const { height, width } = useWindowDimensions();

	return (
		<BrowserRouter>
			<Switch>
				<Route path="/search">
					<div>
						<Search url_backend={url_backend} height={height} width={width}/>
					</div>
				</Route>
				<Route path="/">
					<div>
						<SetupPath url_backend={url_backend} height={height} width={width} />
					</div>
				</Route>
			</Switch>
		</BrowserRouter>
	);
};
export default App;
