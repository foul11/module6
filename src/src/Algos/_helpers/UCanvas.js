import { Vector } from './Vector.js';
import { Figure } from './Figure.js';

export class UCanvas{
	static MODES = {
		VECT: 1,
		// RAST: 2,
	}
	
	static RECT = {
		DELETE: 1,
		SPOINT: 2,
		FPOINT: 3,
		SBOX: 4,
		FBOX: 5,
		LINE: 6,
		IMAGE: 7,
	}
	
	static CHECK = {
		NONE: 1,
		P2P: 2,
		P2R: 3,
		SP2P: 4,
		SP2R: 5,
	}
	
	static #draw_id = 0;
	
	/*
		TODO: Ставить точки по событию mclick, а не только по mmove
	*/
	
	constructor(width, height){
		// this.onstart = null;
		// this.onend = null;
		
		this.onpredraw = null;
		this.ondraw = null;
		
		this.init(width, height);
		
		// this.MaxUndo = 100;
		this.currMode = UCanvas.MODES.VECT;
	}
	
	init(width, height){
		this._createCanvas('', width, height, null, true);
		// this._createCanvas('Perma', width, height, 'black', true);
		
		this.width = width;
		this.height = height;
		
		// this._refillMap(width, height);
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
		// this.UndoReset = [];
		
		this.grid = { x: 1, y: 1 };
		this.isGridDraw = false;
		this.gridColor = '#FFF';
		this.gridWidth = 1;
		
		this.brushSelect = 'Erase';
		this.brushSize = 1;
		this.brushWidth = 1;
		this.brushColor = '#ffffff';
	}
	
	// _refillMap(width, height){
		// this.Map1 = [];
		
		// for(let x = 0; x < width; x++){
			// this.Map1.push([])
			// let Map1 = this.Map1[x];
			
			// for(let y = 0; y < height; y++){
				// Map1.push({
					// inObj: {},
				// });
			// }
		// }
	// }
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		let deltaT = 0;
		
		while(true){
			let ctx = this.offscreenBuffering;
			
			ctx.save();
				ctx.fillStyle = 'black';
				ctx.fillRect(0, 0, this.width, this.height);
			ctx.restore();
			
			if(this.onpredraw instanceof Function)
				this.onpredraw.call(this, deltaT, ctx);
			
			ctx.save();
				// for(let i = 0; i < this.Undo.length; i++){
					// if(i >= this.currUndoI) continue;
					
					// for(let j in this.Undo[i])
						// this._draw(ctx, this.Undo[i][j]);
				// }
				
				// for(let i in this.currUndo)
					// this._draw(ctx, this.currUndo[i]);
				
				if(this.isGridDraw)
					this._draw_grid(ctx, this.grid, this.gridColor, this.gridWidth);
				
				this._cumbacker(function(i, j, obj){
					this._draw(ctx, obj);
				});
			ctx.restore();
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ctx);
			
			deltaT = yield;
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	_createCanvas(pref, width, height, bg = null, lineRound = false){
		let propC = 'offscreenCanvas';
		let propB = 'offscreenBuffering';
		
		this[propC + pref] = document.createElement('canvas');
		this[propC + pref].width = width;
		this[propC + pref].height = height;
		
		this[propB + pref] = this[propC + pref].getContext('2d', { alpha: false });
		
		if(bg){
			this[propB + pref].save();
				this[propB + pref].fillStyle = bg;
				this[propB + pref].fillRect(0, 0, this[propC + pref].width, this[propC + pref].height);
			this[propB + pref].restore();
		}
		
		if(lineRound)
			this[propB + pref].lineCap = 'round';
	}
	
	_draw_grid(ctx, size, color = '#FFF', width = 1){
		ctx.save();
			
			ctx.lineWidth = width;
			ctx.strokeStyle = color;
			
			for(let i = 0; i < this.width; i += size.x){
				let x = Math.round(i / size.x) * size.x + size.x / 2;
				
				ctx.beginPath();
					ctx.moveTo(x, 0);
					ctx.lineTo(x, this.height);
				ctx.stroke();
			}
			
			for(let i = 0; i < this.width; i += size.y){
				let y = Math.round(i / size.y) * size.y + size.y / 2;
				
				ctx.beginPath();
					ctx.moveTo(0, y);
					ctx.lineTo(this.width, y);
				ctx.stroke();
			}
			
		ctx.restore();
	}
	
	_draw(ctx, parm){
		switch(parm.type){
			case UCanvas.RECT.LINE:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.size;
				
				ctx.beginPath();
					ctx.moveTo(parm.x1, parm.y1);
					ctx.lineTo(parm.x2, parm.y2);
				ctx.stroke();
				break;
				
			case UCanvas.RECT.SPOINT:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				
				ctx.beginPath();
					ctx.arc(parm.x1, parm.y1, parm.size, 0, 2 * Math.PI);
				ctx.stroke();
				break;
				
			case UCanvas.RECT.FPOINT:
				ctx.fillStyle = parm.color;
				
				ctx.beginPath();
					ctx.arc(parm.x1, parm.y1, parm.size, 0, 2 * Math.PI);
				ctx.fill();
				break;
				
			case UCanvas.RECT.SBOX:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				
				ctx.strokeRect(parm.x1 - Math.floor(parm.s1 / 2), parm.y1 - Math.floor(parm.s2 / 2), parm.s1, parm.s2);
				break;
				
			case UCanvas.RECT.FBOX:
				ctx.fillStyle = parm.color;
				
				ctx.fillRect(parm.x1 - Math.floor(parm.s1 / 2), parm.y1 - Math.floor(parm.s2 / 2), parm.s1, parm.s2);
				break;
				
			case UCanvas.RECT.IMAGE:
				ctx.drawImage(parm.data, parm.x1 - parm.x2, parm.y1 - parm.y2);
				break;
				
			default:
				throw Error('The couple is broken, this object cannot be drawn');
		}
	}
	
	static invertColor(hex){
		if(hex.indexOf('#') === 0)
			hex = hex.slice(1);
			
		if(hex.length === 3)
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		
		if(hex.length !== 6)
			throw new Error('Invalid HEX color.');
		
		let r = parseInt(hex.slice(0, 2), 16);
		let g = parseInt(hex.slice(2, 4), 16);
		let b = parseInt(hex.slice(4, 6), 16);
		
		let format = (n) => Math.floor(n).toString(16).padStart(2, '0');
		
		return '#' + format(255 - r) + format(255 - g) + format(255 - b);
	}
	
	static hsv2rgb(h, s, v){
		let f = (n, k = (n+h/60)%6) => v - v*s*Math.max(Math.min(k, 4-k, 1), 0);
		let format = (n) => Math.floor(n * 255).toString(16).padStart(2, '0');
		
		return '#' + format(f(5)) + format(f(3)) + format(f(1));
	}
	
	static rgb2hsv(r, g, b){
		let v = Math.max(r, g, b), c = v - Math.min(r, g, b);
		let h = c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
		
		return [60*(h<0?h+6:h), v&&c/v, v];
	}
	
	/*setMode(mode){
		this.currMode = mode;
	}*/
	
	_isOutMap(x, y){
		return x < 0 || y < 0 || Math.floor(x) > (this.width - 1) || Math.floor(y) > (this.height - 1);
	}
	
	_trace(x1, y1, size, callback = null){
		let first = null;
		
		Figure.circle(x1, y1, size, function(x, y){
			if(this._isOutMap(x, y)) return;
			
			if(callback instanceof Function){
				for(let i in this.Map1[x][y].inObj){
					callback.call(this, x, y, i, this.Map1[x][y].inObj[i]);
				}
			}else{
				for(let item of this.Map1[x][y].inObj){
					first = item;
					return false;
				}
			}
		}.bind(this));
		
		return first;
	}
	
	_cumbacker(callback){
		let draws = {};
		
		for(let i = 0; i < this.Undo.length; i++){
			if(i >= this.currUndoI) continue;
			
			for(let j in this.Undo[i]){
				let obj = this.Undo[i][j];
				
				if(obj.type === UCanvas.RECT.DELETE)
					delete draws[obj.delId];
				else
					draws[obj.id] = { i: i, j: j, obj: obj };
			}
		}
		
		for(let i in this.currUndo){
			let obj = this.currUndo[i];
			
			if(obj.type === UCanvas.RECT.DELETE)
				delete draws[obj.delId];
			else
				draws[obj.id] = { i: -1, j: i, obj: obj };
		}
		
		for(let i in draws){
			let obj = draws[i];
			let ret;
			
			if((ret = callback.call(this, obj.i, obj.j, obj.obj)) !== undefined)
				return ret;
		}
	}
	
	_checkRaduis(x1, y1, size){
		let ret = false;
		
		this._cumbacker(function(i, j, obj){
			if(Math.abs(obj.x1 - x1) + Math.abs(obj.y1 - y1) < (obj.size + size)){
				ret = true;
				return false;
			}
		});
		
		return ret;
	}
	
	getForType(type){
		let ret = [];
		
		this._cumbacker(function(i, j, obj){
			if(obj.type === type){
				obj.x = obj.x1;
				obj.y = obj.y1;
				
				ret.push(obj);
			}
		});
		
		return ret;
	}
	
	getAll(){
		let ret = [];
		
		this._cumbacker(function(i, j, obj){
			obj.x = obj.x1;
			obj.y = obj.y1;
			
			ret.push(obj);
		});
		
		return ret;
	}
	
	_tranposeCords(p1, p2, p3 = null, p4 = null){
		if(p3 !== null && p4 !== null){
			return [
				Math.round(p1 / this.grid.x) * this.grid.x,
				Math.round(p2 / this.grid.x) * this.grid.x,
				Math.round(p3 / this.grid.y) * this.grid.y,
				Math.round(p4 / this.grid.y) * this.grid.y,
			];
		}else{
			return [
				Math.round(p1 / this.grid.x) * this.grid.x,
				Math.round(p2 / this.grid.y) * this.grid.y,
			];
		}
	}
	
	_spawnChecker(rectType, x1, y1, size, checkType){
		if(size instanceof Object)
			size = (size[0] + size[1]) / 2;
		
		switch(checkType){
			case UCanvas.CHECK.P2P:
			case UCanvas.CHECK.SP2P:
				if(this._cumbacker(function(i, j, obj){
					if(obj.x1 === x1 && obj.y1 === y1 &&
						(checkType === UCanvas.CHECK.SP2P && obj.type === rectType || true))
						return false;
				}) === false)
					return false;
				return true;
				break;
				
			case UCanvas.CHECK.P2R:
			case UCanvas.CHECK.SP2R:
				if(this._cumbacker(function(i, j, obj){
					// if(rectType === UCanvas.RECT.FBOX || rectType === UCanvas.RECT.SBOX){
						// if(Math.abs(obj.x1 - x1) < Math.floor((obj.s1 + size[0]) / 2) && Math.abs(obj.y1 - y1) < Math.floor((obj.s2 + size[1]) / 2) &&
							// (checkType === UCanvas.CHECK.SP2P && obj.type === rectType || true))
							// return false;
					// }else{
						if(Math.abs(obj.x1 - x1) + Math.abs(obj.y1 - y1) < (obj.size ?? 0 + size) &&
							(checkType === UCanvas.CHECK.SP2P && obj.type === rectType || true))
							return false;
					// }
				}) === false)
					return false;
				return true;
				break;
				
			case UCanvas.CHECK.NONE:
				return true;
				break;
				
			default:
				throw Error('_spawnChecker type error');
		}
	}
	
	brush(x1, y1, x2, y2, check = undefined, img = null){
		let ret;
		
		switch(this.brushSelect){
			case 'StrokeBox':
				return this.brushStrokeBox(x1, y1, this.brushSize, this.brushSize, this.brushWidth, this.brushColor, check);
			
			case 'FillBox':
				return this.brushFillBox(x1, y1, this.brushSize, this.brushSize, this.brushColor, check);
				
			case 'FSBox':
				if((ret = this.brushFillBox(x1, y1, this.brushSize, this.brushSize, this.brushColor, check)) !== false)
					this.brushStrokeBox(x1, y1, this.brushSize, this.brushSize, this.brushWidth, UCanvas.invertColor(this.brushColor), UCanvas.CHECK.NONE);
				
				return ret;
				
			case 'StrokePoint':
				return this.brushStrokePoint(x1, y1, this.brushSize, this.brushWidth, this.brushColor, check);
				
			case 'FillPoint':
				return this.brushFillPoint(x1, y1, this.brushSize, this.brushColor, check);
				
			case 'FSPoint':
				if((ret = this.brushFillPoint(x1, y1, this.brushSize, this.brushColor, check)) !== false)
					this.brushStrokePoint(x1, y1, this.brushSize, this.brushWidth, UCanvas.invertColor(this.brushColor), UCanvas.CHECK.NONE);
				
				return ret;
				
			case 'Line':
				return this.brushLine(x1, y1, x2, y2, this.brushSize, this.brushColor, check);
				
			case 'Image':
				return this.brushImage(img, x1, y1, check);
				
			case 'Erase':
				return this.brushErase(x1, y1, x2 ?? 0, y2 ?? 0, this.brushSize, check);
				
			default:
				throw Error('BrushType is undefined');
		}
	}
	
	brushStrokeBox(x1, y1, s1, s2, outSize, color, check = UCanvas.CHECK.P2R){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(!this._spawnChecker(UCanvas.RECT.SBOX, x1, y1, [s1, s2], check)) return false;
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, y1: y1, s1: s1, s2: s2, outSize: outSize, color: color, type: UCanvas.RECT.SBOX });
		
		return UCanvas.#draw_id++;
	}
	
	brushFillBox(x1, y1, s1, s2, color, check = UCanvas.CHECK.P2R){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(!this._spawnChecker(UCanvas.RECT.FBOX, x1, y1, [s1, s2], check)) return false;
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, y1: y1, s1: s1, s2: s2, color: color, type: UCanvas.RECT.FBOX });
		
		return UCanvas.#draw_id++;
	}
	
	brushStrokePoint(x1, y1, size, outSize, color, check = UCanvas.CHECK.P2R){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(!this._spawnChecker(UCanvas.RECT.SPOINT, x1, y1, size, check)) return false;
		// if(check && this._checkRaduis(x1, y1, size)) return false;
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, y1: y1, size: size, outSize: outSize, color: color, type: UCanvas.RECT.SPOINT });
		
		return UCanvas.#draw_id++;
	}
	
	brushFillPoint(x1, y1, size, color, check = UCanvas.CHECK.P2R){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(!this._spawnChecker(UCanvas.RECT.FPOINT, x1, y1, size, check)) return false;
		// if(check && this._checkRaduis(x1, y1, size)) return false;
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, y1: y1, size: size, color: color, type: UCanvas.RECT.FPOINT });
		
		return UCanvas.#draw_id++;
	}
	
	brushLine(x1, y1, x2, y2, size, color, check = UCanvas.CHECK.NONE){
		[x1, x2, y1, y2] = this._tranposeCords(x1, x2, y1, y2);
		
		if(x1 === x2 && y1 === y2) return false;
		if(!this._spawnChecker(UCanvas.RECT.LINE, x1, y1, size, check)) return false;
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, x2: x2, y1: y1, y2: y2, size: size, color: color, type: UCanvas.RECT.LINE });
		
		return UCanvas.#draw_id++;
	}
	
	brushImage(img, x1, y1, check = UCanvas.CHECK.NONE){
		if(img === null) return false;
		
		[x1, y1] = this._tranposeCords(x1, y1);
		
		let w = Math.floor(img.width / 2);
		let h = Math.floor(img.height / 2);
		
		if(!this._spawnChecker(UCanvas.RECT.IMAGE, x1, y1, [w, h], check)) return false;
		
		if(this.currUndo.length)
			this.endUndo();
		
		this.currUndo.push({ id: UCanvas.#draw_id, x1: x1, y1: y1, x2: w, y2: h, data: img, type: UCanvas.RECT.IMAGE });
		
		return UCanvas.#draw_id++;
	}
	
	brushErase(x1, y1, x2, y2, size, check = UCanvas.CHECK.P2R){
		[x1, x2, y1, y2] = this._tranposeCords(x1, x2, y1, y2);
		
		let ret = false;
		
		this._cumbacker(function(i, j, obj){
			if(Math.abs(obj.x1 - x1) ** 2 + Math.abs(obj.y1 - y1) ** 2 < ((obj.size ?? 0) + size) ** 2){
				this.currUndo.push({ id: UCanvas.#draw_id++, delId: obj.id, type: UCanvas.RECT.DELETE });
				ret = true;
			}
		});
		
		return ret;
	}
	
	eraseId(id){
		this.currUndo.push({ id: UCanvas.#draw_id++, delId: id, type: UCanvas.RECT.DELETE });
	}
	
	fillGrid(callback){
		for(let i = 0; i < this.width; i += this.grid.x)
			for(let j = 0; j < this.height; j += this.grid.y)
				callback.call(this, i, j);
	}
	
	setGridSize(gx, gy = null){
		if(gy === null) gy = gx;
		
		this.grid.x = gx;
		this.grid.y = gy;
	}
	
	setGridDraw(bool){
		this.isGridDraw = bool;
	}
	
	setGridColor(color){
		this.gridColor = color;
	}
	
	setGridWidth(width){
		this.gridWidth = width;
	}
	
	
	setBrushSelect(sel){
		this.brushSelect = sel;
	}
	
	setBrushSize(size){
		this.brushSize = size;
	}
	
	setBrushWidth(width){
		this.brushWidth = width;
	}
	
	setBrushColor(color){
		this.brushColor = color;
	}
	
	setArc(){
		
	}
	
	
	startUndo(){
		this.currUndo = [];
	}
	
	endUndo(){
		if(!this.currUndo.length) return;
		
		this.Undo[this.currUndoI++] = this.currUndo;
		this.currUndo = [];
	}
	
	resize(width, height){ /* TODO: delete object without screen */
		let grid = this.grid;
		let isGridDraw = this.isGridDraw;
		let gridColor = this.gridColor;
		let gridWidth = this.gridWidth;
		
		let brushSize = this.brushSize;
		let brushWidth = this.brushWidth;
		let brushColor = this.brushColor;
		let brushSelect = this.brushSelect;
		
		this.init(width, height);
		
		this.grid = grid;
		this.isGridDraw = isGridDraw;
		this.gridColor = gridColor;
		this.gridWidth = gridWidth;
		
		this.brushSize = brushSize;
		this.brushWidth = brushWidth;
		this.brushColor = brushColor;
		this.brushSelect = brushSelect;
	}
	
	clear(){
		this._createCanvas('Perma', this.width, this.height, 'black', true);
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
	}
	
	undo(){
		if(this.currUndo.length)
			this.endUndo();
		
		this.currUndoI--;
		this.currUndoI = Math.max(this.currUndoI, 0);
	}
	
	redo(){
		this.currUndoI++;
		this.currUndoI = Math.min(this.currUndoI, this.Undo.length);
	}
}