import { CanvasRender } from './Render.js';
import { Matrix } from './Algos/_helpers/Matrix.js';
// import { Config } from './Config.js';
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
	
	/*Config.setConfig([
		{
			type: 'wrapper',
			radio: 'da',
			child: [
				{
					type: 'vert',
					child: [
						{
							type: 'horz',
							child: [
								{
									type: 'radio',
									value: 'da',
								},
								{
									type: 'radio',
									value: 'agacb',
								},
							]
						},
						{
							type: 'horz',
							child: [
								{
									type: 'radio',
								},
								{
									type: 'number',
									placeholder: 'aga',
								}
							]
						}
					]
				},
				{
					type: 'range',
					value: 'd',
					min: 0,
					max: 100,
					step: 1,
					init: 25,
					
					on: {
						// click: () => alert('agasb'),
					}
				}
			]
		},
		{
			type: 'wrapper',
			child: [
				{
					type: 'text'
				},
			]
		}
	]);*/
	
	//render.hello();
	render.genetics();
	// $('[data-algo="ant"]').click();
	$('[data-algo="a_star"]').click();
});