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

const App = () => {
	const { height, width } = useWindowDimensions();

	return (
		<BrowserRouter>
			<Switch>
				<Route path="/">
					<div>
						<SetupPath height={height} width={width} />
					</div>
				</Route>
				<Route path="/search">
					<div>
						<Search height={height} width={width}/>
					</div>
				</Route>
			</Switch>
		</BrowserRouter>
	);
};
export default App;
