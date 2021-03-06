import { Algo_Ant } from './Algos/ant/main.js';
import { Algo_NN } from './Algos/nn/main.js';
import { Algo_a_star } from './Algos/a_star/main.js';
import { Algo_Claster } from './Algos/claster/main.js';
import { Config } from './Config.js';
import { UCanvas } from './Algos/_helpers/UCanvas.js';
import { Matrix } from './Algos/_helpers/Matrix.js';
import { Algo_Genetics } from "./Algos/genetics/main.js";
import { Algo_Super_Genetics } from "./Algos/super_genetics/main.js";
import { Algo_Tree_Solution } from "./Algos/tree_solution/main.js";
import { TreeImage } from "./Algos/_helpers/TreeImage.js";

// #if !__DEV__
	const { drawHighlightedCode: drawHighlight } = require('canvas-syntax-highlight');
// #endif

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
							value: UCvs.gridColor,
							
							on: { input: function(){ UCvs.setGridColor(this.value); }, },
						},
						{
							type: 'checkbox',
							value: 'Draw enable',
							checked: UCvs.isGridDraw,
							
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
			
			SpeedMul(classes, max = 1000, callback = null){
				return {
					type: 'horz',
					child: [
						{
							type: 'range',
							value: 'Speed Multipliyer',
							min: 1,
							max: max,
							init: 1,
							
							on: { input: (e) => { classes.speedMul = parseInt(e.target.value); if(callback instanceof Function) callback.call(e.target, e); } },
						},
					]
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
		
		// this.draw();
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
		let prevState = this.AlgosState.Algo_a_star ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let a_star = prevState.Algo_a_star = prevState.Algo_a_star ?? new Algo_a_star();
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setGridSize(20);
			ret.setGridDraw(true);
			ret.setGridColor('#555555');
			
			ret.setBrushSelect('FillBox');
			ret.setBrushColor('#555555');
			ret.setBrushSize(18);
			ret.setBrushWidth(2);
			
			return ret;
		}).bind(this)();
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
			
			let asp = [render.width / this.width, render.height / this.height];
			
			if(a_star.StartPoint) UCvs._draw(ctx, a_star.StartPoint, asp);
			if(a_star.StartPointO) UCvs._draw(ctx, a_star.StartPointO, asp);
			if(a_star.EndPoint) UCvs._draw(ctx, a_star.EndPoint, asp);
			if(a_star.EndPointO) UCvs._draw(ctx, a_star.EndPointO, asp);
		}.bind(UCvs, this);
		
		let mazeType = 'prima';
		let brushType = null;
		let isDecoMode = false;
		let callBrush = function(...args){
			switch(brushType){
				case 'start':
					if(a_star.StartPoint){
						args = UCvs._tranposeCords(args[0] - UCvs.gridOffset.x, args[1] - UCvs.gridOffset.y);
						if(UCvs._isOutMap(args[0], args[1])) return false;
						
						a_star.StartPointO.x1 = a_star.StartPoint.x1 = args[0];
						a_star.StartPointO.y1 = a_star.StartPoint.y1 = args[1];
					}else{
						UCvs.save();
							UCvs.setBrushColor('#00FF00');
							UCvs.setBrushSize(UCvs.grid.x);
							
							a_star.StartPoint = UCvs.getById(UCvs.brush(...args, UCanvas.CHECK.NONE, { deco: true }));
							a_star.StartPointO = UCvs.getById(a_star.StartPoint.id + 1);
							
							a_star.StartPoint.ondestruct = function(){
								if(!this.StartPoint) return;
								
								this.StartPoint.type = UCanvas.RECT.NONE;
								this.StartPointO.type = UCanvas.RECT.NONE;
								
								this.StartPoint = null;
								this.StartPointO = null;
							}.bind(a_star);
							
							a_star.StartPoint.onconstruct = function(obj){
								if(this.StartPoint) return;
								
								this.StartPoint = obj;
								this.StartPointO = UCvs.getById(obj.id + 1);
								
								this.StartPoint.type = UCanvas.RECT.FBOX;
								this.StartPointO.type = UCanvas.RECT.SBOX;
							}.bind(a_star);
						UCvs.restore();
					}
					break;
					
				case 'end':
					if(a_star.EndPoint){
						args = UCvs._tranposeCords(args[0] - UCvs.gridOffset.x, args[1] - UCvs.gridOffset.y);
						if(UCvs._isOutMap(args[0], args[1])) return false;
						
						a_star.EndPointO.x1 = a_star.EndPoint.x1 = args[0];
						a_star.EndPointO.y1 = a_star.EndPoint.y1 = args[1];
					}else{
						UCvs.save();
							UCvs.setBrushColor('#FF0000');
							UCvs.setBrushSize(UCvs.grid.x);
							
							a_star.EndPoint = UCvs.getById(UCvs.brush(...args, UCanvas.CHECK.NONE, { deco: true }));
							a_star.EndPointO = UCvs.getById(a_star.EndPoint.id + 1);
							
							a_star.EndPoint.ondestruct = function(){
								if(!this.EndPoint) return;
								
								this.EndPoint.type = UCanvas.RECT.NONE;
								this.EndPointO.type = UCanvas.RECT.NONE;
								
								this.EndPoint = null;
								this.EndPointO = null;
							}.bind(a_star);
							
							a_star.EndPoint.onconstruct = function(obj){
								if(this.EndPoint) return;
								
								this.EndPoint = obj;
								this.EndPointO = UCvs.getById(obj.id + 1);
								
								this.EndPoint.type = UCanvas.RECT.FBOX;
								this.EndPointO.type = UCanvas.RECT.SBOX;
							}.bind(a_star);
						UCvs.restore();
					}
					break;
				
				default:
					UCvs.brush(...args, undefined, { deco: isDecoMode });
					break;
			}
		}.bind(this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(...e);
			
			callBrush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
		});
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ UCvs.endUndo(); return; }
			
			callBrush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
			
			e.preventDefault();
			e.stopPropagation();
		};
		this.onkeydown = prevState.onkeydown = prevState.onkeydown ?? function(e){
			if(e.ctrlKey && e.keyCode == 90){ UCvs.undo(); a_star.forceStop = true; return; }
			if(e.ctrlKey && e.keyCode == 89){ UCvs.redo(); a_star.forceStop = true; return; }
		};

		Config.setCtx('a_star');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.SpeedMul(a_star),
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
						on: { radio: { click: function(){ UCvs.setBrushSelect($(this).attr('data-type'));}, }, },
						child: [
							{
								type: 'radio',
								value: 'Brush',
								'data-type': 'FillBox',
								checked: true,
								on: { click: (e) => { brushType = null; } },
							},
							{
								type: 'radio',
								value: 'Start',
								'data-type': 'FSBox',
								on: { click: (e) => { brushType = 'start'; } },
							},
							{
								type: 'radio',
								value: 'End',
								'data-type': 'FSBox',
								on: { click: (e) => { brushType = 'end'; } },
							},
							{
								type: 'radio',
								value: 'Erase',
								'data-type': 'Erase',
								on: { click: (e) => { brushType = null; } },
							},
						]
					},
					{
						type: 'color',
						value: UCvs.brushColor,
						
						on: { input: function(){ UCvs.setBrushColor(this.value); }, },
					},
					{
						type: 'checkbox',
						value: 'DecoMode',
						
						on: { click: function(){ isDecoMode = this.checked; } }
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
				on: { button: { click: () => { a_star.forceStop = true; } } },
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
						type: 'button',
						value: 'Fill-All',
						
						on: { click: (e) => { a_star.forceStop = true; UCvs.fillGrid(function(x, y){ UCvs.brush(x, y, null, null, undefined, { deco: isDecoMode }); }); } },
					},
					{
						type: 'button',
						value: 'A*',
						
						on: {
							click: (e) => {
								if(!a_star.StartPoint) return;
								if(!a_star.EndPoint) return;
								
								let gridC = UCvs.getGridCount();
								let SP = UCvs.toGridCord(a_star.StartPoint);
								let EP = UCvs.toGridCord(a_star.EndPoint);
								
								a_star.forceStop = true;
								a_star.a_star(SP.x, SP.y, EP.x, EP.y);
							}
						},
					},
					{
						type: 'wrapper-vert',
						child: [
							{
								type: 'string',
								value: 'Maze Gen Function',
							},
							{ type: 'pad05em' },
							{
								type: 'horz',
								radio: 'maze',
								on: { radio: { click: (e) => { mazeType = $(e.target).attr('data-type'); } } },
								child: [
									{
										type: 'radio',
										value: 'Prima',
										'data-type': 'prima',
										checked: true,
									},
									{
										type: 'radio',
										value: 'Kruskal',
										'data-type': 'kruskal',
									},
									{
										type: 'radio',
										value: 'Depth',
										'data-type': 'depth',
									},
								],
							},
							{
								type: 'button',
								value: 'Generate Labirint',
								
								on: { click: (e) => { let gridC = UCvs.getGridCount(); a_star.forceStop = true; UCvs.clear(); a_star.labirint(mazeType, gridC.x, gridC.y); } },
							},
						],
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
		
		let UCvsUpdater = UCvs.update();
		let updater = a_star.update(UCvs, UCvsUpdater.next.bind(UCvsUpdater));
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_a_star = prevState;
	}

	claster(){
		let prevState = this.AlgosState.Algo_Claster ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setGridSize(20);
			ret.setGridDraw(true);
			ret.setGridColor('#555555');
			
			ret.setBrushSelect('FSPoint');
			ret.setBrushColor('#ffffff');
			ret.setBrushSize(10);
			ret.setBrushWidth(2);
			
			return ret;
		}).bind(this)();
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		let OnlyKMeanse = false;
		let enableOutCircle = true;
		let cupdater = [
			null,
			null,
			null,
			null,
		];
		
		let Claster = prevState.Claster = prevState.Claster ?? new Algo_Claster(UCvs.width, UCvs.height);
		
		let StartClast = function(){
			let points = UCvs.getForType(UCanvas.RECT.FPOINT);
			
			let distF = $('#claster-dist-radios :checked').attr('data-type');
			let clastC = parseInt($('#claster-count-clasters').val());
			let allDraws = UCvs.getAll();
			
			let methods = ['k_means', 'agglomerative', 'connect_components', 'min_cover_tree'];
			
			if(OnlyKMeanse){
				Claster.changeClastMethod('k_means');
				Claster.changeDistFunc(distF);
				Claster.changeClastCount(clastC);
				
				cupdater[0] = Claster.update(points, allDraws, 0 ,0, enableOutCircle);
				cupdater[0].next();
			}else
				for(let i = 0; i < 4; i++){
					let toPoint = [];
					
					for(let j = 0; j < points.length; j+=4)
						toPoint.push(points[j + i]);
					
					Claster.changeClastMethod(methods[i]);
					Claster.changeDistFunc(distF);
					Claster.changeClastCount(clastC);
					
					cupdater[i] = Claster.update(toPoint, allDraws, 0 ,0, enableOutCircle);
					cupdater[i].next();
				}
		}.bind(this);
		
		UCvs.onpredraw = prevState.onpredraw = prevState.onpredraw ?? function(render, deltaT, ctxImage){
			for(let i = 0; i < 4; i++)
				if(cupdater[i])
					if(cupdater[i].next(deltaT).done)
						cupdater[i] = null;
		}.bind(UCvs, this);
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(UCvs, this);
		
		UCvs.onresize = prevState.onresize = prevState.onresize ?? function(width, height){
			Claster.width = width;
			Claster.height = height;
		}.bind(UCvs);
		
		let callBrush = function(...arg){
			let pi2 = Math.PI / 2;
			
			UCvs.save();
				UCvs.setArc(pi2 * 6, pi2 * 3);
				if(UCvs.brush(...arg) !== false){
					UCvs.setArc(pi2 * 5, pi2 * 2);
					UCvs.brush(...arg, UCanvas.CHECK.NONE);
					UCvs.setArc(pi2 * 4, pi2 * 1);
					UCvs.brush(...arg, UCanvas.CHECK.NONE);
					UCvs.setArc(pi2 * 3, 0);
					UCvs.brush(...arg, UCanvas.CHECK.NONE);
					
					StartClast();
				}
			UCvs.restore();
		};
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((...e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(...e);
			
			callBrush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
		});
		this.onmenter = prevState.onmenter = prevState.onmenter ?? setCursorPos;
		this.onmmove = prevState.onmmove = prevState.onmmove ?? function(e){
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			if(e.buttons !== 1){ UCvs.endUndo(); return; }
			
			callBrush(...this.CAsp(UCvs, x, y), ...this.CAsp(UCvs, cursorPos));
			
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
					this.ConfPatterns.SpeedMul(Claster),
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
						max: 200,
						init: 3,
						
						on: { input: (e) => { StartClast(); }, },
					},
					{
						type: 'checkbox',
						value: 'Enable outline circle',
						checked: true,
						
						on: { click: (e) => { enableOutCircle = e.target.checked; StartClast(); } },
					},
					{
						type: 'checkbox',
						value: 'Only K-Meanse',
						checked: OnlyKMeanse,
						
						on: { click: (e) => { OnlyKMeanse = e.target.checked; StartClast(); } },
					},
					{
						type: 'button',
						value: 'Fill-All',
						
						on: { click: (e) => { UCvs.fillGrid(function(x, y){ callBrush(x, y, null, null); }); } },
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
			checkboxs for 1 2 4 clasters
		*/
		
		let updater = UCvs.update();
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_Claster = prevState;
	}

	genetics(){
		let prevState = this.AlgosState.Algo_Genetics ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setGridSize(40);
			ret.setGridDraw(true);
			ret.setGridColor('#555555');
			
			ret.setBrushSelect('FSPoint');
			ret.setBrushColor('#ffffff');
			ret.setBrushSize(15);
			ret.setBrushWidth(3);
			
			return ret;
		}).bind(this)();
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		let genetics = prevState.genetics = prevState.genetics ?? new Algo_Genetics([]);
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
			if(e.ctrlKey && e.keyCode == 90){ UCvs.undo(); gupdater = null; return; }
			if(e.ctrlKey && e.keyCode == 89){ UCvs.redo(); gupdater = null; return; }
		};
		
		Config.setCtx('genetics');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.SpeedMul(genetics),
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
						type: 'range',
						value: 'Generations',
						min: 1,
						init: genetics.iterateCount,
						max: 10000,
						
						on: { input: function(e){ genetics.setIterateCount(parseInt(this.value)); } },
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
					this.ConfPatterns.UCanvasUndoRedo(UCvs, () => { gupdater = null; }),
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

	super_genetics(){
		let prevState = this.AlgosState.Algo_Super_Genetics ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setBrushSelect('Line');
			ret.setBrushColor('#ab01b7');
			ret.setBrushSize(15);
			ret.setBrushWidth(3);
			
			return ret;
		}).bind(this)();
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		let super_genetics = prevState.super_genetics = prevState.super_genetics ?? new Algo_Super_Genetics();
		
		let gap_code = 300;
		let count_code = Math.floor(UCvs.width / gap_code);
		let step_code = 1;
		let shiftX = 0;
		let shiftY = 20;
		
		let checkSelectBox = (pos) => {
			let pops = super_genetics.curr_out_population;
			
			if(!pops) return [false];
			
			pos = this.CAsp(UCvs, pos);
			let sel = Math.floor((pos[0] - shiftX) / gap_code);
			
			function char_count(str, chr){
				let c = 0;
				
				for(let i = 0; i < str.length; i++)
					if(str[i] === chr)
						c++;
					
				return c;
			}
			
			if(sel >= 0 && sel < count_code && pops[sel * step_code]){
				let spaceCount = char_count(super_genetics.individ_code(pops[sel * step_code]), '\n');
				let selY = (pos[1] - shiftY + 5);
				
				if(selY >= 0 && selY < spaceCount * 20 + 70){
					
					return [pops[sel * step_code], sel * gap_code + shiftX, shiftY - 5, gap_code, spaceCount * 20 + 70];
				}
			}
			
			return [false];
		};
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			function fillTextMultiLine(ctx, text, x, y){
				let lineHeight = ctx.measureText('M').width * 2;
				let lines = text.split('\n');
				
				for (let i = 0; i < lines.length; i++){
					ctx.fillText(lines[i], x, y);
					y += lineHeight;
				}
			}
			
			let pops = super_genetics.curr_out_population;
			
			if(pops){
				ctxImage.save();
					ctxImage.fillStyle = '#ff0000';
					ctxImage.font = '3em monospace';
					
					for(let i = 0; i < count_code; i++){
						if(!pops[i * step_code]) continue;
						
						ctxImage.fillText('{' + (i * step_code) + '} - [' + pops[i * step_code].fit + ']', 10 + i * gap_code + shiftX, 20 + shiftY);
					}
					
					ctxImage.fillStyle = '#ffffff';
					ctxImage.font = '2.25em monospace';
					
					for(let i = 0; i < count_code; i++){
						if(!pops[i * step_code]) continue;
						// #if __DEV__
							fillTextMultiLine(ctxImage, super_genetics.individ_code(pops[i * step_code]), 10 + i * gap_code + shiftX, 50 + shiftY);
						// #endif
						
						// #if !__DEV__
							drawHighlight(ctxImage, {
								language: 'js',
								theme: 'dark',
								code: super_genetics.individ_code(pops[i * step_code])
							}, 10 + i * gap_code + shiftX, 50 + shiftY);
						// #endif
					}
				ctxImage.restore();
				
				let [sel, x, y, w, h] = checkSelectBox(cursorPos);
				
				if(sel !== false){
					ctxImage.save();
						ctxImage.strokeStyle = 'green';
						ctxImage.lineWidth = 2;
						
						ctxImage.strokeRect(x, y, w, h);
					ctxImage.restore();
				}
			}
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(super_genetics, this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(e);
			
			let [sel] = checkSelectBox(cursorPos);
			
			if(sel !== false){
				navigator.clipboard.writeText(
`function fib(a){
	${super_genetics.individ_code(sel).replaceAll(/yield\s*;\s*/g, '').replaceAll('\n', '\n\t')}
	return b;
}`
				);
				
				$('#copy-tyan').css('transform', `translate(${e.pageX}px, ${e.pageY - 200}px)`);
				$('#copy-tyan').stop(true, true).show(150).delay(400).hide(250);
			}
			
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
		
		Config.setCtx('super_genetics');
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					this.ConfPatterns.ChangerFPS(),
					this.ConfPatterns.SpeedMul(super_genetics),
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
								'data-type': 'Line',
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
					// {
						// type: 'range',
						// value: 'Generations',
						// min: 1,
						// init: super_genetics.iterateCount,
						// max: 10000,
						
						// on: { input: function(e){ super_genetics.setIterateCount(parseInt(this.value)); } },
					// },
					{
						type: 'range',
						value: 'Code columns',
						min: 1,
						max: 100,
						init: count_code,
						
						on: { input: function(e){ count_code = parseInt(this.value); } },
					},
					{
						type: 'range',
						value: 'Code columns step',
						min: 1,
						max: 100,
						init: step_code,
						
						on: { input: function(e){ step_code = parseInt(this.value); } },
					},
					{
						type: 'range',
						value: 'Gap width code',
						min: 1,
						max: 1000,
						init: gap_code,
						
						on: { input: function(e){ gap_code = parseInt(this.value); } },
					},
					{
						type: 'range',
						value: 'ShiftX',
						min: 0,
						max: 1000,
						init: shiftX,
						
						on: { input: function(e){ shiftX = parseInt(this.value); } },
					},
					{
						type: 'range',
						value: 'ShiftY',
						min: 0,
						max: 1000,
						init: shiftY,
						
						on: { input: function(e){ shiftY = parseInt(this.value); } },
					},
					{
						type: 'button',
						value: 'start',
						
						on: { click: function(){ super_genetics.start(); } },
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(UCvs, () => { super_genetics.forceStop = true; }),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(UCvs, () => { super_genetics.forceStop = true; }),
				],
			},
		], 'main');
		
		let UCvsUpdater = UCvs.update();
		let updater = prevState.updater = prevState.updater ?? super_genetics.update(UCvs, UCvsUpdater.next.bind(UCvsUpdater)) ;
		
		this.ondraw = updater.next.bind(updater);
		this.AlgosState.Algo_Super_Genetics = prevState;
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
						min: -1,
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
			// -???????????? ???????????? ????????????????, ??????????????, ????????????, ?????????? ????????????
			// -???????????????? ?????????????????? ???????????????????? ?????? ???????? (??????-???? ????????????????)
			// -?????????????????? TODO ?? Ant_base:105
			
			?????????????????????????? ?????????????? ?????? ???????????????? (???????????? ?????????? ???? ?????????????? ?????? ?? ?????????? ???? ?????????????????? (?????????????????? ??????????????????))
			?????????????????????????? ?????? (?? ???????? ?????????????????????? ??????)
			?????????????????? ???????????????? ?????????????? (???????????? ????????????????, ?????????????? ???????????????????? ?????????? (?????? ?????????????? ????????????????), ????????????????, ?????????????? ?????????????????? ????????????????)
			?????????? ?????????????????? ?????????????????? (??????????????????)
			?????? ?????? ?????? ???????????????? (?????????? ???????? ?? ???????? ???????????? ????????????, ???????????? ?????????? ?????? ???? ?????????????????? (???????????????? ?????????? ?????? ?????????????? ????????))
			
			
			?????????? ???????????? ?????? ????????????????
			???????????????????? ?????? ?????????????????????? ???? ??????
			???????????? ????????????
			
			???????????????? ???????????? ???????????? ???????? ???????? ?????? ????????????
			?????????????? ?????? ???????????? ?????? ?????????????????? ???????????????? (??????????????????????) ?????????????? (??????, ????????????????, ????????), ?? ?? ?????????? ???? ???????????? ???????????????????????????? ???? ?????? ?????????????????????? (???????????????????? ????????????)
			?????? ???? ?????????????? ???????????? ??????????????????, ???????????????????? ?????????????????? ??????????????, ?? ???????? ???? ????????????????????, ???? ???????????????????? ?????????????? ???? ????????, ?????? ???? ???????????????? ?? 10 ???????????????? (?????? ???? ?????????? ?????????? ???????? ????-???? ???????????????????? ???????????????????? ?????? ?????????????????? (?????????????????????? ?????????????? ????????????))
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
		
		let drawAABBbox = false;
		
		NN.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
			
			let processeds = NN._preProcessingBeta(ctxImage.getImageData(0, 0, NN.width, NN.height));
			
			if(processeds === false) return false;
			
			// let recognize = 'NN_DATA: [';
			let recognize = '';
			
			for(let i = 0; i < processeds.length; i++){
				let AABB = processeds[i].AABB;
				
				if(drawAABBbox){
					let TextX = AABB[0] + (AABB[2] - AABB[0]) / 2 | 0;
					let TextY = AABB[1];
					
					ctx.save();
						ctx.font = "2em monospace";
						ctx.strokeStyle = 'black';
						ctx.fillStyle = 'red';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'bottom';
						ctx.strokeText(i.toString(), ...render.CAsp(NN, TextX, TextY, false, true));
						ctx.fillText(i.toString(), ...render.CAsp(NN, TextX, TextY, false, true));
					
						ctx.strokeStyle = 'red';
						ctx.beginPath();
							ctx.moveTo(...render.CAsp(NN, AABB[0], AABB[1], false, true));
							ctx.lineTo(...render.CAsp(NN, AABB[2], AABB[1], false, true));
							ctx.lineTo(...render.CAsp(NN, AABB[2], AABB[3], false, true));
							ctx.lineTo(...render.CAsp(NN, AABB[0], AABB[3], false, true));
							ctx.lineTo(...render.CAsp(NN, AABB[0], AABB[1], false, true));
						ctx.stroke();
					ctx.restore();
				}
				
				recognize += NN.NN(NN._grayscaleToLinear(processeds[i].data));
			}
			
			let rationW = ctxWidth / 1200;
			let rationH = ctxHeight / 1200;
			
			let scale = Math.min(rationW, rationH);
			
			let TyanIW = 300 * 0.75 * scale;
			let TyanIH = 300 * scale;
			
			let CloudIW = 150 * 1.38 * scale * Math.max(recognize.length / 5, 1);
			let CloudIH = 150 * scale;
			
			if(this.tyan.isLoad && this.cloud.isLoad){
				ctx.save();
					ctx.drawImage(this.tyan, ctxWidth - TyanIW, ctxHeight - TyanIH, TyanIW, TyanIH);
					ctx.drawImage(this.cloud, ctxWidth - CloudIW - TyanIW + 25 * scale, ctxHeight - CloudIH - TyanIH + 100 * scale, CloudIW, CloudIH);
				ctx.restore();
			}
			
			let TextIW = ctxWidth - CloudIW / 2 - TyanIW + 25 * scale;
			let TextIH = ctxHeight - CloudIH / 2 - TyanIH + 125 * scale;
			
			// recognize += ']';
			
			ctx.save();
				ctx.font = (5 * scale) + "em monospace";
				ctx.strokeStyle = 'black';
				ctx.fillStyle = 'HotPink';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				ctx.lineWidth = 8;
				// ctx.strokeText(recognize, ctx.canvas.width - 10, ctx.canvas.height - 10);
				// ctx.fillText(recognize, ctx.canvas.width - 10, ctx.canvas.height - 10);
				ctx.strokeText(recognize, TextIW, TextIH);
				ctx.fillText(recognize, TextIW, TextIH);
			ctx.restore();
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
					{
						type: 'checkbox',
						value: 'drawAABBbox',
						checked: drawAABBbox,
						on: { click: function(e){ drawAABBbox = this.checked; } }
					}
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(NN, () => needUpdate()),
				],
			},
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
										
										let wh = this.CAsp(NN, img.width, img.height, false, true);
										
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
				],
			},
		], 'main');
		
		/*
			// -???????????????? ?????????? ??????????, ????????????, ????????, ?????????????? ????????, ????????????
			// -???????????? ?? ???????????????????????? ?????????? ????????
			// -?????????????? ?????????????????? ?????????????? ???????????????????? ???????????? ?????????????????? (???? ?????????? ???????????????????? ??????????, ???? ?????????? mousemove, ?? ????????????????)
			// -???????????????? ?????????????????????? ?????? ??????????????????????????, ?????????????????? ??????????????????????
			
			???????? ????????????????
			
			// ?????????????????? ???????????????????????? ?? ???????????????????? ??????????
		*/
		
		let updater = NN.update()
		updater = prevState.updater = prevState.updater ?? updater.next.bind(updater);
		
		this.ondraw = updater;
		this.AlgosState.Algo_NN = prevState;
	}
	
	tree_solution(){
		let prevState = this.AlgosState.Algo_Tree_Solution ?? {};
		this._resetEvent();
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setBrushSelect('Line');
			ret.setBrushColor('#ab01b7');
			ret.setBrushSize(15);
			ret.setBrushWidth(3);
			
			return ret;
		}).bind(this)();
		
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		let tree = prevState.tree = prevState.tree ?? new Algo_Tree_Solution(this.width, this.height);
		
		// let tree = new Algo_Tree_Solution(
			// [
				// {person: 'Homer', hairLength: 0, weight: 250, age: 36, sex: 'male'},
				// {person: 'Marge', hairLength: 10, weight: 150, age: 34, sex: 'female'},
				// {person: 'Bart', hairLength: 2, weight: 90, age: 10, sex: 'male'},
				// {person: 'Lisa', hairLength: 6, weight: 78, age: 8, sex: 'female'},
				// {person: 'Maggie', hairLength: 4, weight: 20, age: 1, sex: 'female'},
				// {person: 'Abe', hairLength: 1, weight: 170, age: 70, sex: 'male'},
				// {person: 'Selma', hairLength: 8, weight: 160, age: 41, sex: 'female'},
				// {person: 'Otto', hairLength: 10, weight: 180, age: 38, sex: 'male'},
				// {person: 'Krusty', hairLength: 6, weight: 200, age: 45, sex: 'male'}
				
				/* Outlook,Temperature,Humidity,Wind,Play Tennis
Sunny,Hot,High,Weak,No
Sunny,Hot,High,Strong,No
Overcast,Hot,High,Weak,Yes
Rain,Mild,High,Weak,Yes
Rain,Cool,Normal,Weak,Yes
Rain,Cool,Normal,Strong,No
Overcast,Cool,Normal,Strong,Yes
Sunny,Mild,High,Weak,No
Sunny,Cool,Normal,Weak,Yes
Rain,Mild,Normal,Weak,Yes
Sunny,Mild,Normal,Strong,Yes
Overcast,Mild,High,Strong,Yes
Overcast,Hot,Normal,Weak,Yes
Rain,Mild,High,Strong,No */
			// ],
			// null,
			// 'sex',
		// );
		
		// console.log(tree.predict({person: 'Comic guy', hairLength: 8, weight: 290, age: 38}));
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(tree, this);
		
		this.onmdown = prevState.onmdown = prevState.onmdown ?? ((e) => {
			let { x, y } = cursorPos;
			
			UCvs.startUndo();
			setCursorPos(e);
			
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
		
		Config.setCtx('tree_solution');
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
								'data-type': 'Line',
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
						type: 'file',
						value: 'File for Train',
						
						on: {
							input: async function(e){
								function readFile(file){
									return new Promise((resolve, reject) => {
										let fileread = new FileReader();  
										fileread.onload = () => {
											resolve(fileread.result);
										};
										fileread.onerror = reject;
										fileread.readAsText(file);
									});
								}
								
								let data = await readFile(this.files[0]);
								
								let struct = null;
								let treeData = [];
								
								for(let i of data.matchAll(/([^\n]+)\n/g)){
									let cols = i[1].split(',');
									
									if(!struct){
										struct = [];
										
										for(let j of cols)
											struct.push(j);
										
										continue;
									}
									
									let pushObj = {};
									
									for(let j = 0; j < cols.length; j++)
										pushObj[struct[j]] = cols[j];
									
									treeData.push(pushObj);
								}
								
								tree.gen_new(treeData, [], struct[struct.length - 1]);
								
								let treeDataImg = [];
								
								/*
attribute: "Outlook"
match:
category: "Yes"
[[Prototype]]: Object
matchedCount: 4
notMatch:
attribute: "Temperature"
match: {category: 'No'}
matchedCount: 2
notMatch:
attribute: "Humidity"
match: {attribute: 'Wind', predicateName: '==', pivot: 'Weak', match: {???}, predicate: ??, ???}
matchedCount: 5
notMatch: {attribute: 'Outlook', predicateName: '==', pivot: 'Rain', match: {???}, predicate: ??, ???}
notMatchedCount: 2
pivot: "Normal"
predicate: ?? (a, b)
predicateName: "=="
[[Prototype]]: Object
notMatchedCount: 7
pivot: "Hot"
predicate: ?? (a, b)
predicateName: "=="
[[Prototype]]: Object
notMatchedCount: 9
pivot: "Overcast"
predicate: ?? (a, b)
predicateName: "=="

								*/
								
								function genTreeDataImg(root, to = null){
									if(to)
										to = [];
									
									if(root.match && root.match.attribute){
										// to.push({
											// value: 
										// })
									}else
										to.push({ value: root.match });
									
									if(root.notMatch instanceof Object){
										
									}else
										to.push({ value: root.notMatch });
									
									return to;
								}
								
								let img = await TreeImage([
									
								]);
								
								console.log(tree.root);
							},
						},
					},
					{
						type: 'button',
						value: 'start',
						
						on: { click: function(){ super_genetics.start(); } },
					},
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasUndoRedo(UCvs, () => { super_genetics.forceStop = true; }),
				],
			},
			{
				type: 'wrapper',
				child: [
					this.ConfPatterns.UCanvasPinkClear(UCvs, () => { super_genetics.forceStop = true; }),
				],
			},
		], 'main');
		
		let UCvsUpdater = UCvs.update();
		let updater = prevState.updater = prevState.updater ?? tree.update(UCvs, UCvsUpdater.next.bind(UCvsUpdater)) ;
		
		this.ondraw = updater.next.bind(updater);
		this.AlgosState.Algo_Tree_Solution = prevState;
	}
	
	async test_UCanvas(){
		let prevState = this.AlgosState.test_UCanvas ?? {};
		
		let cursorPos = { x: 0, y: 0 };
		let UCvs = prevState.UCvs = prevState.UCvs ?? (function(){
			let ret = new UCanvas(this.width, this.height);
			
			ret.setGridSize(40);
			ret.setGridDraw(true);
			ret.setGridColor('#555555');
			
			ret.setBrushSelect('FSPoint');
			ret.setBrushColor('#973f3f');
			ret.setBrushSize(15);
			ret.setBrushWidth(3);
			
			return ret;
		}).bind(this)();
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		let img = await TreeImage([
			{
				value: 'da1',
				child: [
					{
						value: 'da2',
					},
					{
						value: 'da3',
					},
					{
						value: 'da4',
					},
				],
			},
			{
				value: 'da1',
				child: [
					{
						value: 'da2',
						child: [
							{
								value: 'da2',
							child: [
									{
										value: 'da2',
										child: [
											{
												value: 'da2',
												child: [
													{
														value: 'da2',
													},
													{
														value: 'da2',
													},
													{
														value: 'da2',
													},
												],
											},
										],
									},
								],
							},
							{
								value: 'da3',
							},
							{
								value: 'da4',
							},
							{
								value: 'da2',
							},
							{
								value: 'da3',
							},
							{
								value: 'da4',
							},
						],
					},
					{
						value: 'da3',
					},
					{
						value: 'da4',
					},
					{
						value: 'da2',
					},
					{
						value: 'da3',
					},
					{
						value: 'da4',
					},
				],
			},
			{
				value: 'da1',
				child: [
					{
						value: 'da2',
					},
					{
						value: 'da3',
					},
					{
						value: 'da4',
					},
				],
			},
		]);
		
		UCvs.ondraw = prevState.ondraw = prevState.ondraw ?? function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
			ctx.drawImage(img, 0, 0, img.width * 2, img.height * 2, 0, 0, ctxWidth, ctxHeight);
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
							{
								type: 'horz',
								child: [
									{
										type: 'radio',
										value: 'StrokeText',
									},
									{
										type: 'radio',
										value: 'FillText',
									},
									{
										type: 'radio',
										value: 'FSText',
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
					{
						type: 'button',
						value: 'Fill-All',
						
						on: { click: (e) => { UCvs.fillGrid(function(x, y){ UCvs.brush(x, y, null, null); }); } },
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
	
	async draw(now){
		while(true){
			now = await new Promise(requestAnimationFrame);
			
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
					await this.ondraw.call(this, Math.min(deltaT, 100) * this.SpeedMultiplier);
				
				$(this.ctx.canvas).triggerHandler('Render:draw');
				
				this._drawFps(perf - this.lastPerfomans, this.ctx);
				this.lastPerfomans = perf;
			}
			
			// requestAnimationFrame(this.draw.bind(this));
		}
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