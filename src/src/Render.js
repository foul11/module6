import { Algo_Ant } from './Algos/ant/main.js';
import { Algo_NN } from './Algos/nn/main.js';
import { Config } from './Config.js';

export class CanvasRender{
	constructor(ctx, width = null, height = null){
		const { width: ctxWidth, height: ctxHeight } = ctx.canvas.getBoundingClientRect();
		
		this._resetEvent();
		
		this.ctx = ctx;
		
		this._fixed = { width: width, height: height };
		
		this.width = ctxWidth;
		this.height = ctxHeight;
		
		this.averageFPS = [];
		this.maxFPS = 165;
		this.lastFNow;
		this.lastTNow;
		
		this.lastPerfomans;
		this.SpeedMultiplier = 1;
		
		this.AlgosState = {};
		
		ctx.canvas.width = ctxWidth;
		ctx.canvas.height = ctxHeight;
		
		$(ctx.canvas).on('selectstart', function(){ return false; });
		
		$(ctx.canvas).on('mousemove', this.mmove.bind(this));
		$(ctx.canvas).on('mousedown', this.mdown.bind(this));
		$(ctx.canvas).on('mouseenter', this.menter.bind(this));
		
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
		
		this.onkeydown = null;
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
	
	ant(){
		this._resetEvent();
		
		let cursorPos = { x: 0, y: 0 };
		let Ant = this.AlgosState.Algo_Ant ?? new Algo_Ant(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		this.AlgosState.Algo_Ant = Ant;
		
		Ant.ondraw = function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
		}.bind(Ant, this);
		
		let BrushSwitch = 'Walls';
		let BrushSize = 10;
		
		let CalcAspect = function(x, y, repeat = false){
			let aspX = Ant.world.width / this.width;
			let aspY = Ant.world.height / this.height;
			
			return repeat ? [x * aspX, y * aspY, x * aspX, y * aspY] : [x * aspX, y * aspY];
		}.bind(this);
		
		this.onmdown = setCursorPos;
		this.onmenter = setCursorPos;
		this.onmmove = function(e){
			if(e.buttons !== 1) return;
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			let aspX = Ant.world.width / this.width;
			let aspY = Ant.world.height / this.height;
			
			switch(BrushSwitch){
				case 'Walls':
					Ant.spawn(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize, 'Wall');
					break;
					
				case 'Food':
					Ant.spawn(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize, 'Food');
					break;
					
				case 'Erase':
					Ant.erase(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize, '');
					break;
					
				case 'Marker_food':
					Ant.spawn(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize, 'Marker_food');
					break;
			}
			
			e.preventDefault();
			e.stopPropagation();
		}
		
		Config.clear();
		Config.add([
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'range',
						value: 'FPS',
						step: 1,
						min: 1,
						max: 165,
						init: 165,
						on: {
							input: function(e){ this.maxFPS = $(e.target).val(); }.bind(this),
						},
					},
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
						init: 10,
						max: 100,
						on: { input: function(){ BrushSize = this.value }, },
					}
				],
			},
			{
				type: 'wrapper',
				child: [
					{
						type: 'button',
						value: 'Spawn Colony',
						on: { click: function(e){
							$(this.ctx.canvas).on('click.conf', function(e){ Ant.spawn(...CalcAspect(e.offsetX,e.offsetY, true), 0, 'Colony'); $(this).off('click.conf'); });
						}.bind(this), },
					},
				],
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
						value: 'Set',
						on: { click: () => { Ant.resize(parseInt($('#conf-width').val()) || this.width, parseInt($('#conf-height').val()) || this.height); }, },
					},
				]
			},
			{
				type: 'wrapper',
				child: [
					{
						type: 'range',
						value: 'test change ang 0 entity',
						min: 0,
						init: 180,
						max: 360,
						on: { input: function(){ Ant.world.tickList[0].rotate(parseInt(180 - this.value) / (180 / Math.PI)); this.value = 180; }, },
					},
				],
			},
		]);
		
		let updater = Ant.update();
		
		this.ondraw = updater.next.bind(updater);
	}
	
	nn(){
		this._resetEvent();
		
		let cursorPos = { x: 0, y: 0 };
		let NN = this.AlgosState.Algo_NN ?? new Algo_NN(this.width, this.height);
		let setCursorPos = (e) => { cursorPos.x = e.offsetX; cursorPos.y = e.offsetY; };
		
		this.AlgosState.Algo_NN = NN;
		
		NN.ondraw = function(render, deltaT, ctxImage){
			let ctx = render.ctx;
			let ctxWidth = render.width;
			let ctxHeight = render.height;
			
			ctx.drawImage(ctxImage.canvas, 0, 0, ctxWidth, ctxHeight);
			
			let processed = NN._preProcessing(ctxImage.getImageData(0, 0, NN.width, NN.height), ctx);
			
			if(processed !== false){
				ctx.putImageData(new ImageData(processed.data, processed.width, processed.height), 100, 100);
				
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
		
		let BrushSwitch = 'brush';
		let BrushColor = '#FFF';
		let BrushSize = 10;
		
		let CalcAspect = function(x, y, repeat = false){
			let aspX = NN.width / this.width;
			let aspY = NN.height / this.height;
			
			return repeat ? [x * aspX, y * aspY, x * aspX, y * aspY] : [x * aspX, y * aspY];
		}.bind(this);
		
		this.onmdown = (...e) => { NN.startUndo(); setCursorPos(...e); };
		this.onmenter = setCursorPos;
		this.onmmove = function(e){
			if(e.buttons !== 1){ NN.endUndo(); return; }
			let { x, y } = cursorPos;
			
			setCursorPos(e);
			
			let aspX = NN.width / this.width;
			let aspY = NN.height / this.height;
			
			switch(BrushSwitch){
				case 'brush':
					NN.brush(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize, BrushColor);
					break;
				
				case 'erase':
					NN.erase(x * aspX, y * aspY, cursorPos.x * aspX, cursorPos.y * aspY, BrushSize);
					break;
			}
			
			e.preventDefault();
			e.stopPropagation();
		}
		this.onkeydown = function(e){
			if(e.ctrlKey && e.key == 'z'){ NN.undo(); return; }
			if(e.ctrlKey && e.key == 'y'){ NN.redo(); return; }
		};
		
		Config.clear();
		Config.add([
		]);
		
		let updater = NN.update();
		
		this.ondraw = updater.next.bind(updater);
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
				this.ondraw.call(this, deltaT * this.SpeedMultiplier);
			
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
	
	kdown(...args){
		if(this.onkeydown instanceof Function)
			this.onkeydown.call(this, ...args);
	}
};