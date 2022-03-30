import { CanvasRender } from './Render.js';

$(function(){
	let canvas = $('#canvas_demo_algo');
	let ctx = canvas[0].getContext('2d');
	let render = new CanvasRender(ctx);
	
	$('.algo_nav a').on('click', function(e){
		if($(this).attr('active')) return;
		
		$('a', $(this).parent()).attr('active', null);
		$(this).attr('active', true);
		
		render[$(this).data('algo')]();
		
		e.preventDefault();
		e.stopPropagation();
	}).on('mousedown', function(e){
		return false;
	});
	
	render.hello();
	
	// $('[data-algo="ant"]').click();
	$('[data-algo="nn"]').click();
});