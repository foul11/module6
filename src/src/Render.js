import { Algo_Ant } from './Algos/ant/main.js';
import { Algo_NN } from './Algos/nn/main.js';
import { Algo_a_star } from './Algos/a_star/main.js';
import { Algo_Claster } from './Algos/claster/main.js';
import { Config } from './Config.js';
import { UCanvas } from './Algos/_helpers/UCanvas.js';
import { Matrix } from './Algos/_helpers/Matrix.js';
import { Algo_Genetics } from "./Algos/genetics/main";

export class CanvasRender{
	constructor(ctx, width = null, height = null){
		const { width: ctxWidth, height: ctxHeight } = ctx.canvas.getBoundingClientRect();
		
		this.ctx = ctx;
		
		this._fixed = { width: width, height: height };
		
		this.width = ctxWidth;
		this.height = ctxHeight;
		
		this._resetEvent();
		
		this.averageFPS = [];
		this.maxFPS = 165;
		this.lastFNow;
		this.lastTNow;
		
		this.lastPerfomans;
		this.SpeedMultiplier = 1;
		
		this.AlgosState = {};
		
		this.ConfPatternsStore = {
			ChangerSize: {},
		};
		
		this.ConfPatterns = {
			ChangerFPS: function(){
				return {
					group: 'ChangerFPS',
					type: 'range',
					value: 'FPS',
					step: 1,
					min: 1,
					max: 165,
					init: 165,
					on: {
						input: function(e, trust = true){ this.maxFPS = $(e.target).val(); if(trust) $('[group="ChangerFPS"]').val(this.maxFPS).trigger('input', false); }.bind(this),
						'Config:create': function(e){ $(e.target).val(this.maxFPS).trigger('input', false); }.bind(this),
					},
				};
			}.bind(this),
			
			ChangerSize: function(callback, defSize = null){ /* callback(width, height) */
				return {
					type: 'vert',
					child: [
						{
							type: 'horz',
							on: {
								text: {
									input: function(e){
										let target = e.target;
										let group = $(target).attr('group');
										
										target.value = /\d+/.exec(target.value)?.[0] ?? '';
										
										$('[group="'+ group +'"]').val(target.value);
										this.ConfPatternsStore.ChangerSize[group] = target.value;
									}.bind(this),
									
									'Config:create': function(e){ $(e.target).val(this.ConfPatternsStore.ChangerSize[$(e.target).attr('group')]); }.bind(this),
								},
							},
							child: [
								{
									group: 'ChangerSize-width',
									type: 'text',
									placeholder: 'Width',
									min: 0,
								},
								{
									group: 'ChangerSize-height',
									type: 'text',
									placeholder: 'Height',
									min: 0,
								},
							],
						},
						{
							type: 'button',
							value: 'Set',
							on: {
								click: () => {
									callback.call(this,
										parseInt($('[group="ChangerSize-width"]').val()) || (defSize ? defSize : this.width),
										parseInt($('[group="ChangerSize-height"]').val()) || (defSize ? defSize / (this.width / this.height) : this.height),
									);
								},
							},
						},
					],
				};
			}.bind(this),
			
			
			UCanvasGrid: function(UCvs){
				let gridId = Config._cyrb53(Config._randomStr(20));
				
				return {
					type: 'vert',
					child: [
						{
							type: 'string',
							value: 'Grid Settings',
						},
						{ type: 'pad05em' },
						{
							type: 'range',
							value: 'GridSize',
							id: gridId,
							step: 1,
							min: 1,
							max: 100,
							init: UCvs.grid.x,
							
							on: { input: function(){ UCvs.setGridSize(parseInt(this.value)); } },
						},
						{
							type: 'range',
							value: 'GridWidth',
							step: 1,
							min: 1,
							max: 10,
							init: 1,
							
							on: { input: function(){ UCvs.setGridWidth(parseInt(this.value)); } },
						},
						{
							type: 'color',
							value: '#555555',
							
							on: { input: function(){ UCvs.setGridColor(this.value); }, },
						},
						{
							type: 'checkbox',
							value: 'Draw enable',
							checked: true,
							
							on: { click: function(){ UCvs.setGridDraw(this.checked); } },
						},
						{
							type: 'checkbox',
							value: 'Grid enable',
							checked: true,
							
							on: { click: function(){ UCvs.setGridDraw(this.checked); UCvs.setGridSize(this.checked ? parseInt($('#' + Config.ctx + '-' + gridId).val()) : 1); } },
						},
					],
				};
			},
			
			UCanvasPinkClear: function(UCvs, callback = null){
				return {
					type: 'button',
					class: 'col-HotPink',
					value: '!!!WARGING!!!_____Clear_____!!!WARGING!!!',
					on: {
						click: (e) => { UCvs.clear(); if(callback instanceof Function) callback.call(e.target, e); },
					},
				};
			},
			
			UCanvasUndoRedo(UCvs, callback = null){
				return {
					type: 'horz',
					child: [
						{
							type: 'button',
							value: 'Undo',
							on: { click: (e) => { UCvs.undo(); if(callback instanceof Function) callback.call(e.target, e); }, },
						},
						{
							type: 'button',
							value: 'Redo',
							on: { click: (e) => { UCvs.redo(); if(callback instanceof Function) callback.call(e.target, e); }, },
						},
					],
				};
			},
		};
		
		ctx.canvas.width = ctxWidth;
		ctx.canvas.height = ctxHeight;
		
		$(ctx.canvas).on('selectstart', function(){ return false; });
		
		$(ctx.canvas).on('mousemove', this.mmove.bind(this));
		$(ctx.canvas).on('mousedown', this.mdown.bind(this));
		$(ctx.canvas).on('mouseenter', this.menter.bind(this));
		$(ctx.canvas).on('click', this.mclick.bind(this));
		
		$(window).on('keydown', this.kdown.bind(this));
		$(window).on('resize', this.resize.bind(this));
		
		requestAnimationFrame(this.draw.bind(this));
	}
	
	_resetEvent(){
		this.onresize = null;
		this.ondraw = null;
		
		this.onmmove = null;
		this.onmdown = null;
		this.onmenter = null;
		this.onmclick = null;
		
		this.onkeydown = null;
		
		$(this.ctx.canvas).off('.conf');
		$(window).off('.conf');
	}
	
	hello(){
		this._resetEvent();
		
		let imgHello = $('<img/>');
		this.imgHello = imgHello;
		
		imgHello[0].src = 'img/5.png';
		
		let helloDraw = function(render, a1, a2, a3){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, ctxWidth, ctxHeight);
			
			let aspect = this.naturalWidth / this.naturalHeight;
			let multiplier = ctxWidth / this.naturalWidth;
			
			let height = this.naturalWidth / aspect * multiplier;
			let width = this.naturalWidth * multiplier;
			
			if(height > ctxHeight){
				multiplier = ctxHeight / this.naturalHeight;
				
				height = this.naturalHeight * multiplier;
				width = this.naturalHeight * aspect * multiplier;
			}
			
			let sX = (ctxWidth - width) / 2;
			let sY = (ctxHeight - height) / 2;
			
			ctx.drawImage(this, sX, sY, width, height);
		}.bind(imgHello[0], this);
		
		imgHello.on('load', helloDraw);
		this.onresize = helloDraw;
	}
	
	a_star(){
		let a_star = new Algo_a_star(new Matrix(this.width, this.height), this.width, this.height);
		
		a_star.ondraw = function(render, deltaT, out){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;

			ctx.clearRect(0, 0, ctxWidth, ctxHeight);
			//ctx.save();
				//ctx.fillStyle = out.color;
				//ctx.fillRect(out.x, out.y, 2, 2);
			ctx.restore();
		}.bind(a_star, this);

		Config.setCtx('a_star');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'horz',
						on: {
							text:{
								input: function(e){
									this.value = /\d+/.exec(this.value)?.[0] ?? '';
								},
							},
						},
						child: [
							{
								type: 'text',
								placeholder: 'Width',
								id: 'conf-width',
								min: 0,
							},
							{
								type: 'text',
								placeholder: 'Height',
								id: 'conf-height',
								min: 0,
							},
						],
					},
					{
						type: 'button',
						value: 'Create maze',
						on: {
							click: function(){
								let width = parseInt($('#a_star-conf-width').val()) + 2;
								let height = parseInt($('#a_star-conf-height').val()) + 2;
								
								a_star.resize(new Matrix(width || this.width,  height || this.height), width || this.width, height || this.height);
								a_star.labirint_prima();
							},
						},
					},
				]
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'horz',
						on: {
							text:{
								input: function(e){
									this.value = /\d+/.exec(this.value)?.[0] ?? '';
								},
							},
						},
						child: [
							{
								type: 'text',
								placeholder: 'start_x',
								id: 'start_x',
								min: 0,
							},
							{
								type: 'text',
								placeholder: 'start_y',
								id: 'start_y',
								min: 0,
							},
							{
								type: 'text',
								placeholder: 'end_x',
								id: 'end_x',
								min: 0,
							},
							{
								type: 'text',
								placeholder: 'end_y',
								id: 'end_y',
								min: 0,
							},
						],
					},
					{
						type: 'button',
						value: 'Find Path',
						on: {
							click: function(){
								let start_x = parseInt($('#a_star-start_x').val());
								let start_y = parseInt($('#a_star-start_y').val());
								let end_x = parseInt($('#a_star-end_x').val());
								let end_y = parseInt($('#a_star-end_y').val());
								
								a_star.a_star(start_x, start_y, end_x, end_y);
							},
						},
					},
				]
			},
			
		], 'main');

		let updater = a_star.update();
		
		this.ondraw = updater.next.bind(updater);
	}

	claster(){
		let prevState = this.AlgosState.Algo_Claster ?? {};
		// let arr = [
			// [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			// [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
			// [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
			// [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
			// [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
			// [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
			// [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			// [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
			// [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
			// [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
		// ]
		// let mass = new Matrix();
		// mass = arr;
		// let Cl = new Algo_Claster(mass);
		// console.log(Cl.k_means(4));
		
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? new UCanvas(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		UCvs.setGridSize(20);
		UCvs.setGridDraw(true);
		UCvs.setGridColor('#555');
		
		UCvs.setBrushSelect('FSPoint');
		UCvs.setBrushColor('#ffffff');
		UCvs.setBrushSize(10);
		UCvs.setBrushWidth(2);
		
		let enableOutCircle = true;
		let cupdater = null;
		let StartClast = function(){
			let Claster = (new Algo_Claster(UCvs.getForType(UCanvas.RECT.FPOINT), UCvs.width, UCvs.height));
			Claster.changeDistFunc($('#claster-dist-radios :checked').attr('data-type'));
			Claster.changeClastCount(parseInt($('#claster-count-clasters').val()));
			cupdater = Claster.update(UCvs.getAll(), 0 ,0, enableOutCircle);
		}.bind(this);
		
		UCvs.onpredraw = prevState.onpredraw = prevState.onpredraw ?? function(render, deltaT, ctxImage){
			if(cupdater)
				if(cupdater.next(deltaT).done)
					cupdater = null;
		}.bind(UCvs, this);
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(UCvs, this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(...e);
			
			if(UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos)) !== false)
				StartClast();
		});
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ UCvs.endUndo(); return; }
			
			if(UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos)) !== false)
				StartClast();
			
			e.preventDefault();
			e.stopPropagation();
		};
		this.onkeydown = prevState.onkeydown = prevState.onkeydown ?? function(e){
			if(e.ctrlKey && e.keyCode == 90){ UCvs.undo(); return; }
			if(e.ctrlKey && e.keyCode == 89){ UCvs.redo(); return; }
		};
		
		Config.setCtx('claster');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.ChangerSize(UCvs.resize.bind(UCvs)),
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Brush',
					},
					{
						type: 'horz',
						radio: 'Brush',
						on: { radio: { click: function(){ UCvs.setBrushSelect($(this).attr('data-type')); }, }, },
						child: [
							{
								type: 'radio',
								value: 'Brush',
								'data-type': 'FSPoint',
								checked: true,
							},
							{
								type: 'radio',
								value: 'Erase',
								'data-type': 'Erase',
							},
						]
					},
					{
						type: 'color',
						value: UCvs.brushColor,
						
						on: { input: function(){ UCvs.setBrushColor(this.value); }, },
					},
					{
						type: 'range',
						value: 'Size',
						min: 1,
						init: UCvs.brushSize,
						max: 100,
						on: { input: function(){ UCvs.setBrushSize(parseInt(this.value)); }, },
					},
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.UCanvasGrid(UCvs),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(UCvs),
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Algo Settings',
					},
					{ type: 'pad05em' },
					{
						type: 'vert',
						radio: 'Dist',
						id: 'dist-radios',
						
						on: { click: (e) => { StartClast(); } },
						child: [
							{
								type: 'horz',
								child: [
									{
										type: 'radio',
										value: 'Euclid',
										'data-type': 'Euclid',
										checked: true,
									},
									{
										type: 'radio',
										value: 'Euclid square',
										'data-type': 'Euclid_square',
									},
								],
							},
							{
								type: 'horz',
								child: [
									{
										type: 'radio',
										value: 'Manhattan',
										'data-type': 'Manhattan',
									},
									{
										type: 'radio',
										value: 'Chebyshev',
										'data-type': 'Chebyshev',
									},
								],
							},
						],
					},
					{ type: 'pad05em' },
					{
						type: 'range',
						value: 'Count Clasters',
						id: 'count-clasters',
						step: 1,
						min: 1,
						max: 50,
						init: 1,
						
						on: { input: (e) => { StartClast(); }, },
					},
					{
						type: 'checkbox',
						value: 'Enable outline circle',
						checked: true,
						
						on: { click: (e) => { enableOutCircle = e.target.checked; StartClast(); } },
					},
					{
						type: 'button',
						value: 'Fill-All',
						
						on: { click: (e) => { UCvs.fillGrid(function(x, y){ UCvs.brush(x, y); }); } },
					},
					{
						type: 'button',
						value: 'Start',
						
						on: { click: (e) => { StartClast(); } },
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(UCvs),
				],
			},
		], 'main');
		
		/*
			adds arc - point div 3 color
			speed multiplayer with for genetics/claster
		*/
		
		let updater = UCvs.update();
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_Claster = prevState;
	}

	genetics(){
		let prevState = this.AlgosState.Algo_Genetics ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? new UCanvas(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		UCvs.setGridSize(40);
		UCvs.setGridDraw(true);
		UCvs.setGridColor('#555');
		
		UCvs.setBrushSelect('FSPoint');
		UCvs.setBrushColor('#ffffff');
		UCvs.setBrushSize(15);
		UCvs.setBrushWidth(3);
		
		let genetics = new Algo_Genetics([]);
		let gupdater = null;
		
		UCvs.onpredraw = prevState.onpredraw = prevState.onpredraw ?? function(render, deltaT, ctxImage){
			if(gupdater)
				if(gupdater.next(deltaT).done)
					gupdater = null;
		}.bind(UCvs, this);
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(UCvs, this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(...e);
			
			UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
		});
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ UCvs.endUndo(); return; }
			
			UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
			
			e.preventDefault();
			e.stopPropagation();
		};
		this.onkeydown = prevState.onkeydown = prevState.onkeydown ?? function(e){
			if(e.ctrlKey && e.keyCode == 90){ UCvs.undo(); return; }
			if(e.ctrlKey && e.keyCode == 89){ UCvs.redo(); return; }
		};
		
		Config.setCtx('genetics');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.ChangerSize(UCvs.resize.bind(UCvs)),
				]
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Brush',
					},
					{
						type: 'horz',
						radio: 'Brush',
						on: { radio: { click: function(){ UCvs.setBrushSelect($(this).attr('data-type')); }, }, },
						child: [
							{
								type: 'radio',
								value: 'Brush',
								'data-type': 'FSPoint',
								checked: true,
							},
							{
								type: 'radio',
								value: 'Erase',
								'data-type': 'Erase',
							},
						]
					},
					{
						type: 'color',
						value: UCvs.brushColor,
						
						on: { input: function(){ UCvs.setBrushColor(this.value); }, },
					},
					{
						type: 'range',
						value: 'Size',
						min: 1,
						init: UCvs.brushSize,
						max: 100,
						on: { input: function(){ UCvs.setBrushSize(parseInt(this.value)); }, },
					},
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.UCanvasGrid(UCvs),
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Algo Settings',
					},
					{
						type: 'button',
						value: 'start',
						
						on: { click: function(){ genetics.setInput(UCvs.getForType(UCanvas.RECT.FPOINT)); gupdater = genetics.update(UCvs.offscreenBuffering); } },
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(UCvs),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(UCvs, () => { gupdater = null; }),
				],
			},
		], 'main');
		
		let updater = UCvs.update();
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_Genetics = prevState;
	}

	ant(){
		let prevState = this.AlgosState.Algo_Ant ?? {};
		this._resetEvent();
		
		let cursorPos = { x: 0, y: 0 };
		let Ant = prevState.Ant = prevState.Ant ?? new Algo_Ant(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		Ant.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(Ant, this);
		
		let BrushSwitch = 'Walls';
		let BrushSize = 10;
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? setCursorPos;
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			if(e.buttons !== 1) return;
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			switch(BrushSwitch){
				case 'Walls':
					Ant.spawn(...this.CAsp(Ant.world, x, y), ...this.CAsp(Ant.world, cursorPos), BrushSize, 'Wall');
					break;
					
				case 'Food':
					Ant.spawn(...this.CAsp(Ant.world, x, y), ...this.CAsp(Ant.world, cursorPos), BrushSize, 'Food');
					break;
					
				case 'Erase':
					Ant.erase(...this.CAsp(Ant.world, x, y), ...this.CAsp(Ant.world, cursorPos), BrushSize, '');
					break;
					
				case 'Marker_food':
					Ant.spawn(...this.CAsp(Ant.world, x, y), ...this.CAsp(Ant.world, cursorPos), BrushSize, 'Marker_food');
					break;
			}
			
			e.preventDefault();
			e.stopPropagation();
		}
		
		Config.setCtx('ant');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					{
						type: 'range',
						value: 'Speed multiplier',
						step: 0.1,
						min: 0.1,
						max: 10,
						init: 1,
						on: {
							input: function(e){ this.SpeedMultiplier = $(e.target).val(); }.bind(this),
						},
					},
					this.ConfPatterns.ChangerSize(Ant.resize.bind(Ant)),
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Brush',
					},
					{
						type: 'horz',
						radio: 'Brush',
						on: { radio: { click: function(){ BrushSwitch = this.value }, }, },
						child: [
							{
								type: 'radio',
								value: 'Walls',
								checked: true,
							},
							{
								type: 'radio',
								value: 'Food',
							},
							{
								type: 'radio',
								value: 'Erase',
							},
							{
								type: 'radio',
								value: 'Marker_food',
							},
						]
					},
					{
						type: 'range',
						value: 'Size',
						min: 1,
						init: BrushSize,
						max: 100,
						on: { input: function(){ BrushSize = this.value }, },
					}
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{ type: 'pad0125em' },
					{
						type: 'string',
						value: 'Global Settings',
					},
					{ type: 'pad05em' },
					{
						type: 'wrapper-vert',
						child: [
							{
								type: 'string',
								value: 'VisibleSettings',
							},
							{
								type: 'horz',
								child: [
									{
										type: 'checkbox',
										value: 'Fermone',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableRenderer('Marker_food', !e.target.checked); Ant.disableRenderer('Marker_home', !e.target.checked); } },
									},
									{
										type: 'checkbox',
										value: 'Ant',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableRenderer('Ant_base', !e.target.checked); } },
									},
									{
										type: 'checkbox',
										value: 'Colony',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableRenderer('Colony', !e.target.checked); } },
									},
									{
										type: 'checkbox',
										value: 'Food',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableRenderer('Food', !e.target.checked); } },
									},
								],
							},
						],
					},
					{
						type: 'wrapper-vert',
						child: [
							{
								type: 'string',
								value: 'TickerSettings',
							},
							{
								type: 'horz',
								child: [
									{
										type: 'checkbox',
										value: 'Fermone',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableTicker('Marker_food', !e.target.checked); Ant.disableTicker('Marker_home', !e.target.checked); } },
									},
									{
										type: 'checkbox',
										value: 'Ant',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableTicker('Ant_base', !e.target.checked); } },
									},
									{
										type: 'checkbox',
										value: 'Colony',
										checked: true,
										
										on: { click: (e) =>{ Ant.disableTicker('Colony', !e.target.checked); } },
									},
								],
							},
						],
					},
					{
						type: 'wrapper-vert',
						child: [
							{
								type: 'string',
								value: 'Colony',
							},
							// { type: 'pad05em' },
							{
								type: 'range',
								value: 'Ant count',
								min: 1,
								max: 1000,
								init: Ant.getSettings('colonyDefAnts'),
								on: { input: function(){ Ant.setSettings('colonyDefAnts', parseInt(this.value)); } },
							},
							{
								type: 'range',
								value: 'Ant spawed mul speed (not work)',
								step: 0.1,
								min: 0.1,
								max: 10,
								init: 1,
							},
							{
								type: 'range',
								value: 'Ant fermone spawn chance (not work)',
								step: 0.01,
								min: 0,
								max: 1,
								init: 1,
							},
							{
								type: 'button',
								value: 'Spawn Colony',
								on: {
									click: (e) => {
										this.onmclick = (e) => {
											Ant.spawn(...this.CAsp(Ant.world, e.offsetX, e.offsetY, true), 0, 'Colony');
											this.onmclick = null;
										};
									},
								},
							},
						],
					},
					{
						type: 'wrapper-vert',
						child: [
							{
								type: 'string',
								value: 'Ant_base',
							},
							{ type: 'pad05em' },
							{
								type: 'wrapper-vert',
								child: [
									{
										type: 'string',
										value: 'MovType',
									},
									{
										type: 'horz',
										radio: 'ALGO_PATH',
										child: [
											{
												type: 'radio',
												value: 'BoxType',
												checked: true,
												
												on: { click: (e) =>{ Ant.algo_path(1); } },
											},
											{
												type: 'radio',
												value: 'TraceType',
												
												on: { click: (e) =>{ Ant.algo_path(2); } },
											},
										],
									},
								],
							}
						],
					},
					// {
						// type: 'wrapper',
						// child: [
							// {
								
							// },
						// ],
					// },
				],
			},
			{
				type: 'wrapper',
				child: [
					{
						type: 'checkbox',
						value: 'UltraSuperMegaConfigMode',
						on: {
							click: (e) => {
								Ant.superConfigurableMode(e.target.checked);
							},
						},
					},
				],
			},
			// {
				// type: 'wrapper',
				// child: [
					// {
						// type: 'range',
						// value: 'test change ang 0 entity',
						// min: 0,
						// init: 180,
						// max: 360,
						// on: { input: function(){ Ant.world.tickList[0].rotate(parseInt(180 - this.value) / (180 / Math.PI)); this.value = 180; }, },
					// },
				// ],
			// },
		], 'main');
		
		/*
			// -Кнопка скрыть феромоны, муравьи, стенки, любое ентити
			// -Добавить изменения параметров для улия (кол-во муравьев)
			// -Выполнить TODO в Ant_base:105
			
			Отталкивающий феромон для муравьев (ложить рядом со стенкой или с таким же феромоном (действует испарение))
			Интенсивность еды (и Флаг бесконечная еда)
			настройка отдельно муравья (радиус зоркости, частота феромоного следа (для каждого отдельно), скорости, частоты изменения движения)
			общие настройки феромонов (испарение)
			чит мод для муравьев (могут идти в улий откуда угодно, всегда знают где он находится (отдельно режим для ломания стен))
			
			
			Время смерти для муравьев
			Обновление без зависимости от фпс
			Жирные ентити
			
			Выделить кнопку спавна улия если она нажата
			Сделать еще канвас для отрисовки медленых (статических) энтитей (еда, феромоны, улии), и с каким то шансом перерисовывать на нем изображение (конкретное ентити)
			Что бы муравьи ходили правильно, запоминать последний феромон, и если он попадается, то пропускать поворот на него, так же задержка в 10 итераций (так же косяк может быть из-за несеточной структуоры для феромонов (попробывать сделать сеткой))
		*/
		
		let updater = Ant.update();
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_Ant = prevState;
	}
	
	nn(){
		let prevState = this.AlgosState.Algo_NN ?? {};
		this._resetEvent();
		
		let cursorPos = { x: 0, y: 0 };
		let NN = prevState.NN = prevState.NN ?? new Algo_NN(400, 400 / (this.width / this.height));
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		NN.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
			
			let processed = NN._preProcessing(ctxImage.getImageData(0, 0, NN.width, NN.height));
			
			if(processed !== false){
				let AABB = processed.AABB;
				
				ctx.save();
					ctx.strokeStyle = 'red';
					ctx.beginPath();
					ctx.moveTo(...render.CAsp(NN, AABB[0], AABB[1], false, true));
					ctx.lineTo(...render.CAsp(NN, AABB[2], AABB[1], false, true));
					ctx.lineTo(...render.CAsp(NN, AABB[2], AABB[3], false, true));
					ctx.lineTo(...render.CAsp(NN, AABB[0], AABB[3], false, true));
					ctx.lineTo(...render.CAsp(NN, AABB[0], AABB[1], false, true));
					ctx.stroke();
				ctx.restore();
				
				// ctx.save();
					// ctx.drawImage(ctx.canvas, 0, 0, ctxWidth / 2, ctxHeight / 2, ctxWidth / 2, ctxHeight / 2 , ctxWidth / 8, ctxHeight / 8);
				// ctx.restore();
				
				let recognize = 'NN_DATA: [' + NN.NN(NN._grayscaleToLinear(processed.data)) + ']';
				
				ctx.save();
					ctx.font = "2.5em monospace";
					ctx.strokeStyle = 'black';
					ctx.fillStyle = 'red';
					ctx.textAlign = 'right';
					ctx.textBaseline = 'bottom';
					ctx.lineWidth = 8;
					ctx.strokeText(recognize, ctx.canvas.width - 10, ctx.canvas.height - 10);
					ctx.fillText(recognize, ctx.canvas.width - 10, ctx.canvas.height - 10);
				ctx.restore();
			}
		}.bind(NN, this);
		
		let UpdateMode = 'realtime';
		let switchUpdateMode = function(mode){
			this.ondraw = null;
			UpdateMode = mode;
			
			switch(mode){
				case 'realtime':
					this.ondraw = prevState.updater;
					break;
					
				case 'mousemove':
					break;
					
				case 'button':
					break;
			}
		}.bind(this);
		
		let needUpdate = function(){
			if(UpdateMode != 'realtime')
				prevState.updater.call(this);
		}.bind(this);
		
		let BrushSwitch = 'Brush';
		let BrushColor = '#FFF';
		let BrushSize = 20;
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => { NN.startUndo(); setCursorPos(...e); });
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ NN.endUndo(); return; }
			
			switch(BrushSwitch){
				case 'Brush':
					NN.brush(...this.CAsp(NN, x, y), ...this.CAsp(NN, cursorPos), BrushSize, BrushColor);
					break;
				
				case 'Erase':
					NN.erase(...this.CAsp(NN, x, y), ...this.CAsp(NN, cursorPos), BrushSize);
					break;
			}
			
			e.preventDefault();
			e.stopPropagation();
			
			if(UpdateMode == 'mousemove')
				prevState.updater.call(this);
		};
		this.onkeydown = prevState.onkeydown = prevState.onkeydown ?? function(e){
			if(e.ctrlKey && e.keyCode == 90){ NN.undo(); needUpdate(); return; }
			if(e.ctrlKey && e.keyCode == 89){ NN.redo(); needUpdate(); return; }
		};
		
		Config.setCtx('nn');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.ChangerSize(NN.resize.bind(NN), 400),
				]
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Brush',
					},
					{
						type: 'horz',
						radio: 'Brush',
						on: { radio: { click: function(){ BrushSwitch = this.value; }, }, },
						child: [
							{
								type: 'radio',
								value: 'Brush',
								checked: true,
							},
							{
								type: 'radio',
								value: 'Erase',
							},
						]
					},
					{
						type: 'color',
						value: '#ffffff',
						
						on: { input: function(){ BrushColor = this.value; }, },
					},
					{
						type: 'range',
						value: 'Size',
						min: 1,
						init: BrushSize,
						max: 100,
						on: { input: function(){ BrushSize = this.value; }, },
					},
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'UpdateMode',
					},
					{
						type: 'horz',
						radio: 'update-mode',
						child: [
							{
								type: 'radio',
								value: 'Realtime',
								checked: true,
								on: { click: (e) => switchUpdateMode('realtime'), },
							},
							{
								type: 'radio',
								value: 'MouseMove',
								on: { click: (e) => switchUpdateMode('mousemove'), },
							},
							{
								type: 'radio',
								value: 'Button',
								on: { click: (e) => switchUpdateMode('button'), },
							},
						],
					},
					{
						type: 'button',
						value: 'Update',
						on: { click: (e) => prevState.updater.call(this), },
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(NN, () => needUpdate()),
				],
			},
			// {
				// type: 'wrapper-vert',
				// child: [
					// {
						// type: 'text',
						// placeholder: 'GridSize',
						// id: 'conf-gridsize',
						// min: 0,
					// },
					// {
						// type: 'button',
						// value: 'Set',
						// on: { click: () => null, },
					// },
				// ]
			// },
			{
				type: 'wrapper',
				child: [
					{
						type: 'file',
						value: 'loadImage',
						on: {
							input: (e) => {
								if(e.target.files){
									let img = new Image();
									img.onload = function(){ URL.revokeObjectURL(this.src); };
									img.src = URL.createObjectURL(e.target.files[0]);
									
									this.onmclick = (e) => {
										NN.brushImage(img, ...this.CAsp(NN, e.offsetX, e.offsetY));
										$(this.ctx.canvas).off('Render:draw.loadImage');
										this.onmclick = null;
									};
									
									$(this.ctx.canvas).off('Render:draw.loadImage');
									$(this.ctx.canvas).on('Render:draw.conf.loadImage', (e) => {
										let ctx = this.ctx;
										
										let wh = this.CalcAspect(NN, img.width, img.height, false, true);
										
										let w = Math.floor(wh[0] / 2);
										let h = Math.floor(wh[1] / 2);
										
										ctx.save();
											ctx.strokeStyle = 'green';
											ctx.strokeRect(cursorPos.x - w, cursorPos.y - h, wh[0], wh[1]);
										ctx.restore();
									});
									
									e.target.value = '';
								}
							},
						},
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(NN, () => needUpdate()),
					// {
						// type: 'button',
						// class: 'col-HotPink',
						// value: '!!!WARGING!!!_____Clear_____!!!WARGING!!!',
						// on: {
							// click: (e) => { NN.clear(); needUpdate(); },
						// },
					// },
				],
			},
		], 'main');
		
		/*
			// -Дописать выбор кисти, размер, цвет, очистка поля, ресайз
			// -Кнопки в конфигурации рендо ундо
			// -Сделать несколько режимов обновления экрана нейросети (во время отпускания мышки, во время mousemove, и риалтайм)
			// -загрузки изображения для распознования, сохранить изображение
			
			распознование нескольких цифр \
			ЛГБТ Кисточка
			
			// Нейросеть конфигурация в пиксельный режим
		*/
		
		let updater = NN.update()
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_NN = prevState;
	}
	
	test_UCanvas(){
		let prevState = this.AlgosState.test_UCanvas ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? new UCanvas(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		UCvs.setGridSize(40);
		UCvs.setGridDraw(true);
		UCvs.setGridColor('#555');
		
		UCvs.setBrushSelect('FSPoint');
		UCvs.setBrushColor('#973f3f');
		UCvs.setBrushSize(15);
		UCvs.setBrushWidth(3);
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(UCvs, this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(...e);
			
			UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
		});
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ UCvs.endUndo(); return; }
			
			UCvs.brush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
			
			e.preventDefault();
			e.stopPropagation();
		};
		this.onkeydown = prevState.onkeydown = prevState.onkeydown ?? function(e){
			if(e.ctrlKey && e.keyCode == 90){ UCvs.undo(); return; }
			if(e.ctrlKey && e.keyCode == 89){ UCvs.redo(); return; }
		};
		
		Config.setCtx('test_UCanvas');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.ChangerSize(UCvs.resize.bind(UCvs)),
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: 'Brush',
					},
					{
						type: 'vert',
						radio: 'Brush',
						on: { radio: { click: function(){ UCvs.setBrushSelect(this.value); }, }, },
						child: [
							{
								type: 'horz',
								child: [
									{
										type: 'radio',
										value: 'FillPoint',
									},
									{
										type: 'radio',
										value: 'StrokePoint',
									},
									{
										type: 'radio',
										value: 'FSPoint',
										checked: true,
									},
									{
										type: 'radio',
										value: 'FillBox',
									},
								],
							},
							{
								type: 'horz',
								child: [
									{
										type: 'radio',
										value: 'StrokeBox',
									},
									{
										type: 'radio',
										value: 'FSBox',
									},
									{
										type: 'radio',
										value: 'Line',
									},
									{
										type: 'radio',
										value: 'Erase',
									},
								],
							},
						],
					},
					{
						type: 'color',
						value: UCvs.brushColor,
						
						on: { input: function(){ UCvs.setBrushColor(this.value); }, },
					},
					{
						type: 'range',
						value: 'Size',
						min: 1,
						init: UCvs.brushSize,
						max: 100,
						on: { input: function(){ UCvs.setBrushSize(parseInt(this.value)) }, },
					},
				],
			},
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.UCanvasGrid(UCvs),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(UCvs),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(UCvs),
				],
			},
		], 'main');
		
		let updater = UCvs.update();
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.test_UCanvas = prevState;
	}
	
	CAsp(cvs, x, y = null, repeat = false, rev = false){
		let aspX = cvs.width / this.width;
		let aspY = cvs.height / this.height;
		
		if(x instanceof Object)
			y = x.y, x = x.x;
		
		if(rev) aspX = 1 / aspX, aspY = 1 / aspY;
		
		return repeat ? [x * aspX, y * aspY, x * aspX, y * aspY] : [x * aspX, y * aspY];
	}
	
	_drawFps(deltaT, ctx){
		this.averageFPS.push(deltaT);
		if(this.averageFPS.length > 20)
			this.averageFPS.splice(0, 1);
		
		let sum = 0;
		
		for(let i in this.averageFPS)
			sum += this.averageFPS[i];
		
		let fps = "FPS: " + Math.round(1000 / (sum / this.averageFPS.length), 2);
		
		ctx.save();
			ctx.font = "2.5em monospace";
			ctx.strokeStyle = 'black';
			ctx.fillStyle = 'red';
			ctx.textAlign = 'right';
			ctx.textBaseline = 'top';
			ctx.lineWidth = 8;
			ctx.strokeText(fps, ctx.canvas.width - 10, 10);
			ctx.fillText(fps, ctx.canvas.width - 10, 10);
		ctx.restore();
	}
	
	draw(now){
		if(!this.lastPerfomans){ this.lastPerfomans = performance.now(); }
		if(!this.lastTNow){ this.lastTNow = now; }
		if(!this.lastFNow){ this.lastFNow = now; }
		
		let perf = performance.now();
		
		let deltaF = now - this.lastFNow;
		let delay = (1000 / this.maxFPS);
		
		if(deltaF >= delay){
			let deltaT = now - this.lastTNow;
			
			this.lastFNow = now - (Math.min(deltaF, 1000) - delay);
			this.lastTNow = now;
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, Math.min(deltaT, 100) * this.SpeedMultiplier);
			
			$(this.ctx.canvas).triggerHandler('Render:draw');
			
			this._drawFps(perf - this.lastPerfomans, this.ctx);
			this.lastPerfomans = perf;
		}
		
		requestAnimationFrame(this.draw.bind(this));
	}
	
	resize(){
		if(this._fixed.height && this._fixed.width) return;
		
		if(this._fixed.height) this.ctx.canvas.height = this._fixed.height; else this.ctx.canvas.height = this.ctx.canvas.clientHeight;
		if(this._fixed.width)  this.ctx.canvas.width  = this._fixed.width;  else this.ctx.canvas.width  = this.ctx.canvas.clientWidth;
		
		this.height = this.ctx.canvas.height;
		this.width = this.ctx.canvas.width;
		
		if(this.onresize instanceof Function)
			this.onresize.call(this);
	}
	
	mdown(...args){
		if(this.onmdown instanceof Function)
			this.onmdown.call(this, ...args);
	}
	
	menter(...args){
		if(this.onmenter instanceof Function)
			this.onmenter.call(this, ...args);
	}
	
	mmove(...args){
		if(this.onmmove instanceof Function)
			this.onmmove.call(this, ...args);
	}
	
	mclick(...args){
		if(this.onmclick instanceof Function)
			this.onmclick.call(this, ...args);
	}
	
	kdown(...args){
		if(this.onkeydown instanceof Function)
			this.onkeydown.call(this, ...args);
	}
};