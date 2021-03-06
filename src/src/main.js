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
	
	/*
		//-В систему сборки добавить деверлопер (откл лоад скрин и веса получаются с сервера) и продакшен мод (сюда можно лоад скрины и сборку весов для нейронов)
		
		loadscreen с выбором режимов, 'анимешник' и 'мамка за спиной' (добавлять везде сенкроусед)
		сделать уже эту шапку (можно добавить авторов, переключения режимов (сенскроусед), светлый режим)
		Рефакторинг кода нейроки и муравьев
		Сплит экрана
		
		В хеадер добавить реквизиты для донатов (bitcoin, yandex, qiwi)
		
		делаю дерево решений (--- сначало дизайн ---, потом алгоритм).
		доделаваю дизайн сайта.
		доделаваю муравьев (тупа настройки добавить для каждого муравья и тп).
	*/
	
	// $('[data-algo="ant"]').click();
	// $('[data-algo="nn"]').click();
	// $('[data-algo="claster"]').click();
	// $('[data-algo="genetics"]').click();
	// $('[data-algo="super_genetics"]').click();
	// $('[data-algo="a_star"]').click();
	// $('[data-algo="test_UCanvas"]').click();
	// $('[data-algo="tree_solution"]').click();
});
