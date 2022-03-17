import { CanvasRender } from './Render.js';
import { Matrix } from './Algos/_helpers/Matrix.js';

$(function(){
	let canvas = $('#canvas_demo_algo');
	let ctx = canvas[0].getContext('2d');
	
	let render = new CanvasRender(ctx);
	render.hello();
	
	console.log(new Matrix(10, 10));
	console.log(new Matrix(10, 10).length);
	console.log(new Matrix(10, 20).length);
	console.log(new Matrix(10, 20)[3].length);
});