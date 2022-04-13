import { Vector } from './Vector.js';
import { Figure } from './Figure.js';

export class UCanvas{
	static MODES = {
		VECT: 1,
		// RAST: 2,
	}
	
	static RECT = {
		DELETE: 1,
		NONE: 2,
		SPOINT: 3,
		FPOINT: 4,
		SBOX: 5,
		FBOX: 6,
		LINE: 7,
		STEXT: 8,
		FTEXT: 9,
		IMAGE: 10,
	}
	
	static CHECK = {
		NONE: 1,
		P2P: 2,
		P2R: 3,
		SP2P: 4,
		SP2R: 5,
		P2B: 6,
		SP2B: 7,
	}
	
	static ALIGN = {
		LEFT: 1,
		RIGTH: 2,
		CENTER: 3,
		TOP: 4,
		BOTTOM: 8,
		MIDDLE: 12,
	}
	
	static #draw_id = 0;
	
	constructor(width, height){
		// this.onstart = null;
		// this.onend = null;
		
		this.onpredraw = null;
		this.ondraw = null;
		
		this.onclear = null;
		this.onbrush = null;
		this.ongridchange = null;
		
		this.init(width, height);
		this.saveStack = [];
		
		this.currMode = UCanvas.MODES.VECT;
	}
	
	init(width, height){
		this._createCanvas('', width, height, null, true);
		
		this.width = width;
		this.height = height;
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
		
		this.drawHashMap = {};
		
		this.gridOffset = { x: 0, y: 0 };
		this.grid = { x: 1, y: 1 };
		this.isGridDraw = false;
		this.gridColor = '#ffffff';
		this.gridWidth = 1;
		
		this.brushSelect = 'Erase';
		this.brushSize = 1;
		this.brushWidth = 1;
		this.brushColor = '#ffffff';
		this.brushText = 'TEST';
		this.brushFont = '3em monospace';
		this.brushAlign = 0;
		
		this.arcStart = 0;
		this.arcEnd = Math.PI * 2;
	}
	
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
				let x = Math.round(i / size.x) * size.x + this.gridOffset.x //+ size.x / 2;
				
				ctx.beginPath();
					ctx.moveTo(x, this.gridOffset.y);
					ctx.lineTo(x, this.height - this.gridOffset.y);
				ctx.stroke();
			}
			
			for(let i = 0; i < this.width; i += size.y){
				let y = Math.round(i / size.y) * size.y + this.gridOffset.y//+ size.y / 2;
				
				ctx.beginPath();
					ctx.moveTo(this.gridOffset.x, y);
					ctx.lineTo(this.width - this.gridOffset.x, y);
				ctx.stroke();
			}
			
		ctx.restore();
	}
	
	_draw(ctx, parm, aspScaler = null){
		if(aspScaler === null) aspScaler = [1, 1];
		
		switch(parm.type){
			case UCanvas.RECT.NONE:
				break;
			
			case UCanvas.RECT.LINE:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.size;
				
				ctx.beginPath();
					// ctx.moveTo(parm.x1, parm.y1);
					// ctx.lineTo(parm.x2, parm.y2);
					ctx.moveTo(parm.x1 * aspScaler[0], parm.y1 * aspScaler[1]);
					ctx.lineTo(parm.x2 * aspScaler[0], parm.y2 * aspScaler[1]);
				ctx.stroke();
				break;
				
			case UCanvas.RECT.SPOINT:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				
				ctx.beginPath();
					// ctx.arc(parm.x1, parm.y1, parm.size, parm.arcStart, parm.arcEnd);
					ctx.ellipse(parm.x1 * aspScaler[0], parm.y1 * aspScaler[1], parm.size * aspScaler[0], parm.size * aspScaler[1], 0, parm.arcStart, parm.arcEnd);
				ctx.stroke();
				break;
				
			case UCanvas.RECT.FPOINT:
				ctx.fillStyle = parm.color;
				
				ctx.beginPath();
					ctx.moveTo(parm.x1, parm.y1);
					// ctx.arc(parm.x1, parm.y1, parm.size, parm.arcStart, parm.arcEnd);
					ctx.ellipse(parm.x1 * aspScaler[0], parm.y1 * aspScaler[1], parm.size * aspScaler[0], parm.size * aspScaler[1], 0, parm.arcStart, parm.arcEnd);
				ctx.fill();
				break;
				
			case UCanvas.RECT.SBOX:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				
				// ctx.strokeRect(parm.x1 - Math.floor(parm.s1 / 2), parm.y1 - Math.floor(parm.s2 / 2), parm.s1, parm.s2);
				ctx.strokeRect((parm.x1 - Math.floor(parm.s1 / 2))  * aspScaler[0], (parm.y1 - Math.floor(parm.s2 / 2))  * aspScaler[1], parm.s1 * aspScaler[0], parm.s2 * aspScaler[1]);
				break;
				
			case UCanvas.RECT.FBOX:
				ctx.fillStyle = parm.color;
				
				// ctx.fillRect(parm.x1 - Math.floor(parm.s1 / 2), parm.y1 - Math.floor(parm.s2 / 2), parm.s1, parm.s2);
				ctx.fillRect((parm.x1 - Math.floor(parm.s1 / 2)) * aspScaler[0], (parm.y1 - Math.floor(parm.s2 / 2)) * aspScaler[1], parm.s1 * aspScaler[0], parm.s2 * aspScaler[1]);
				break;
				
			case UCanvas.RECT.STEXT:
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				ctx.font = parm.font;
				ctx.textAlign = parm.align & UCanvas.ALIGN.LEFT ? (parm.align & UCanvas.ALIGN.RIGTH ? 'center' : 'left') : (parm.align & UCanvas.ALIGN.RIGTH ? 'right' : '');
				ctx.textBaseline = parm.align & UCanvas.ALIGN.TOP ? (parm.align & UCanvas.ALIGN.BOTTOM ? 'middle' : 'top') : (parm.align & UCanvas.ALIGN.RIGTH ? 'bottom' : '');
				
				// ctx.strokeText(parm.text, parm.x1, parm.y1);
				ctx.strokeText(parm.text, parm.x1 * aspScaler[0], parm.y1 * aspScaler[1]);
				break;
				
			case UCanvas.RECT.FTEXT:
				ctx.fillStyle = parm.color;
				ctx.lineWidth = parm.outSize;
				ctx.font = parm.font;
				ctx.textAlign = parm.align & UCanvas.ALIGN.LEFT ? (parm.align & UCanvas.ALIGN.RIGTH ? 'center' : 'left') : (parm.align & UCanvas.ALIGN.RIGTH ? 'right' : '');
				ctx.textBaseline = parm.align & UCanvas.ALIGN.TOP ? (parm.align & UCanvas.ALIGN.BOTTOM ? 'middle' : 'top') : (parm.align & UCanvas.ALIGN.RIGTH ? 'bottom' : '');
				
				// ctx.fillText(parm.text, parm.x1, parm.y1);
				ctx.fillText(parm.text, parm.x1 * aspScaler[0], parm.y1 * aspScaler[1]);
				break;
				
			case UCanvas.RECT.IMAGE:
				// ctx.drawImage(parm.data, parm.x1 - parm.x2, parm.y1 - parm.y2);
				ctx.drawImage(parm.data, (parm.x1 - parm.x2) * aspScaler[0], (parm.y1 - parm.y2) * aspScaler[1]);
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
	
	/*setMode(mode){ // not realised
		this.currMode = mode;
	}*/
	
	_isOutMap(x, y){
		return x < 0 || y < 0 || Math.floor(x) > (this.width - 1) || Math.floor(y) > (this.height - 1);
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
				Math.floor(p1 / this.grid.x) * this.grid.x + Math.floor(this.grid.x / 2) + this.gridOffset.x,
				Math.floor(p2 / this.grid.x) * this.grid.x + Math.floor(this.grid.x / 2) + this.gridOffset.x,
				Math.floor(p3 / this.grid.y) * this.grid.y + Math.floor(this.grid.y / 2) + this.gridOffset.y,
				Math.floor(p4 / this.grid.y) * this.grid.y + Math.floor(this.grid.y / 2) + this.gridOffset.y,
			];
		}else{
			return [
				Math.floor(p1 / this.grid.x) * this.grid.x + Math.floor(this.grid.x / 2) + this.gridOffset.x,
				Math.floor(p2 / this.grid.y) * this.grid.y + Math.floor(this.grid.y / 2) + this.gridOffset.y,
			];
		}
	}
	
	_spawnChecker(rectType, x1, y1, size, checkType){
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
				if(size instanceof Object)
					size = (size[0] + size[1]) / 4;
				
				if(this._cumbacker(function(i, j, obj){
					if(Math.abs(obj.x1 - x1) ** 2 + Math.abs(obj.y1 - y1) ** 2 < ((obj.size ?? ((obj.s1 + obj.s1) / 4)) + size) ** 2 &&
						(checkType === UCanvas.CHECK.SP2P && obj.type === rectType || true))
						return false;
				}) === false)
					return false;
				return true;
				break;
				
				
			case UCanvas.CHECK.P2B:
			case UCanvas.CHECK.SP2B:
				if(!(size instanceof Object))
					size = [size * 2, size * 2];
				
				if(this._cumbacker(function(i, j, obj){
					if(Math.abs(obj.x1 - x1) < (((obj.s1 ?? (obj.size * 2)) + size[0]) / 2) && Math.abs(obj.y1 - y1) < (((obj.s2 ?? (obj.size * 2)) + size[1]) / 2) &&
						(checkType === UCanvas.CHECK.SP2P && obj.type === rectType || true))
						return false;
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
	
	brush(x1, y1, x2, y2, check = undefined, extend = {}, img = null){
		let ret;
		
		if(x1) x1 -= this.gridOffset.x;
		if(x2) x2 -= this.gridOffset.x;
		if(y1) y1 -= this.gridOffset.y;
		if(y2) y2 -= this.gridOffset.y;
		
		switch(this.brushSelect){
			case 'StrokeText':
				return this.brushStrokeText(x1, y1, this.brushText, this.brushFont, this.brushAlign, this.brushWidth, this.brushColor, check, extend);
			
			case 'FillText':
				return this.brushFillText(x1, y1, this.brushText, this.brushFont, this.brushAlign, this.brushColor, check, extend);
				
			case 'FSText':
				if((ret = this.brushStrokeText(x1, y1, this.brushText, this.brushFont, this.brushAlign, this.brushWidth, UCanvas.invertColor(this.brushColor), UCanvas.CHECK.NONE, extend)) !== false)
					this.brushFillText(x1, y1, this.brushText, this.brushFont, this.brushAlign, this.brushColor, check, extend);
				
				return ret;
				
			case 'StrokeBox':
				return this.brushStrokeBox(x1, y1, this.brushSize, this.brushSize, this.brushWidth, this.brushColor, check, extend);
			
			case 'FillBox':
				return this.brushFillBox(x1, y1, this.brushSize, this.brushSize, this.brushColor, check, extend);
				
			case 'FSBox':
				if((ret = this.brushFillBox(x1, y1, this.brushSize, this.brushSize, this.brushColor, check, extend)) !== false)
					this.brushStrokeBox(x1, y1, this.brushSize, this.brushSize, this.brushWidth, UCanvas.invertColor(this.brushColor), UCanvas.CHECK.NONE, extend);
				
				return ret;
				
			case 'StrokePoint':
				return this.brushStrokePoint(x1, y1, this.brushSize, this.brushWidth, this.brushColor, check, extend);
				
			case 'FillPoint':
				return this.brushFillPoint(x1, y1, this.brushSize, this.brushColor, check, extend);
				
			case 'FSPoint':
				if((ret = this.brushFillPoint(x1, y1, this.brushSize, this.brushColor, check, extend)) !== false)
					this.brushStrokePoint(x1, y1, this.brushSize, this.brushWidth, UCanvas.invertColor(this.brushColor), UCanvas.CHECK.NONE, extend);
				
				return ret;
				
			case 'Line':
				return this.brushLine(x1, y1, x2, y2, this.brushSize, this.brushColor, check, extend);
				
			case 'Image':
				return this.brushImage(img, x1, y1, check, extend);
				
			case 'Erase':
				return this.brushErase(x1, y1, x2 ?? this.gridOffset.x, y2 ?? this.gridOffset.y, this.brushSize, check, extend);
				
			default:
				throw Error('BrushType is undefined');
		}
	}
	
	_onBrushCallback(obj){
		if(obj.type === UCanvas.RECT.DELETE){
			obj = Object.assign({}, obj.link);
			obj.type = UCanvas.RECT.DELETE;
		}
		
		if(this.onbrush instanceof Function)
			this.onbrush.call(this, obj, Math.floor((obj.x1 - this.gridOffset.x) / this.grid.x), Math.floor((obj.y1 - this.gridOffset.y) / this.grid.y));
		
		if(obj.type !== UCanvas.RECT.DELETE)
			if(obj.onconstruct instanceof Function)
				obj.onconstruct.call(this, obj);
	}
	
	brushStrokeText(x1, y1, text, font, align, outSize, color, check = UCanvas.CHECK.NONE, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.STEXT, x1, y1, 0, check)) return false;
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, text: text, font: font, align: align, outSize: outSize, color: color, type: UCanvas.RECT.STEXT }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushFillText(x1, y1, text, font, align, color, check = UCanvas.CHECK.NONE, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.FTEXT, x1, y1, 0, check)) return false;
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, text: text, font: font, align: align, color: color, type: UCanvas.RECT.FTEXT }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushStrokeBox(x1, y1, s1, s2, outSize, color, check = UCanvas.CHECK.P2R, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.SBOX, x1, y1, [s1, s2], check)) return false;
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, s1: s1, s2: s2, outSize: outSize, color: color, type: UCanvas.RECT.SBOX }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushFillBox(x1, y1, s1, s2, color, check = UCanvas.CHECK.P2R, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.FBOX, x1, y1, [s1, s2], check)) return false;
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, s1: s1, s2: s2, color: color, type: UCanvas.RECT.FBOX }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushStrokePoint(x1, y1, size, outSize, color, check = UCanvas.CHECK.P2R, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.SPOINT, x1, y1, size, check)) return false;
		// if(check && this._checkRaduis(x1, y1, size)) return false;
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, size: size, arcStart: this.arcStart, arcEnd: this.arcEnd, outSize: outSize, color: color, type: UCanvas.RECT.SPOINT }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushFillPoint(x1, y1, size, color, check = UCanvas.CHECK.P2R, extend = {}){
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		if(!this._spawnChecker(UCanvas.RECT.FPOINT, x1, y1, size, check)) return false;
		// if(check && this._checkRaduis(x1, y1, size)) return false;
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, size: size, arcStart: this.arcStart, arcEnd: this.arcEnd, color: color, type: UCanvas.RECT.FPOINT }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushLine(x1, y1, x2, y2, size, color, check = UCanvas.CHECK.NONE, extend = {}){
		[x1, x2, y1, y2] = this._tranposeCords(x1, x2, y1, y2);
		
		if(this._isOutMap(x1, y1)) return false;
		if(this._isOutMap(x2, y2)) return false;
		if(x1 === x2 && y1 === y2) return false;
		if(!this._spawnChecker(UCanvas.RECT.LINE, x1, y1, size, check)) return false;
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, x2: x2, y1: y1, y2: y2, size: size, color: color, type: UCanvas.RECT.LINE }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushImage(img, x1, y1, check = UCanvas.CHECK.NONE, extend = {}){
		if(img === null) return false;
		
		[x1, y1] = this._tranposeCords(x1, y1);
		
		if(this._isOutMap(x1, y1)) return false;
		
		let w = Math.floor(img.width / 2);
		let h = Math.floor(img.height / 2);
		
		if(!this._spawnChecker(UCanvas.RECT.IMAGE, x1, y1, [w, h], check)) return false;
		
		if(this.currUndo.length)
			this.endUndo();
		
		let obj = Object.assign({ id: UCanvas.#draw_id, x1: x1, y1: y1, x2: w, y2: h, data: img, type: UCanvas.RECT.IMAGE }, extend);
		
		this.currUndo.push(obj);
		this.drawHashMap[obj.id] = obj;
		
		this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
		
		return UCanvas.#draw_id++;
	}
	
	brushErase(x1, y1, x2, y2, size, check = UCanvas.CHECK.P2R, extend = {}){
		[x1, x2, y1, y2] = this._tranposeCords(x1, x2, y1, y2);
		
		if(this._isOutMap(x1, y1)) return false;
		if(this._isOutMap(x2, y2)) return false;
		
		let ret = false;
		
		this._cumbacker(function(i, j, obj){
			if(Math.abs(obj.x1 - x1) ** 2 + Math.abs(obj.y1 - y1) ** 2 < (size) ** 2){
				this.currUndo.push(Object.assign({ id: UCanvas.#draw_id++, delId: obj.id, link: obj, type: UCanvas.RECT.DELETE }, extend));
				this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
				
				if(obj.ondestruct instanceof Function)
					obj.ondestruct.call(this, obj);
				
				ret = true;
			}
		});
		
		return ret;
	}
	
	eraseId(id){
		this.currUndo.push({ id: UCanvas.#draw_id++, delId: id, type: UCanvas.RECT.DELETE });
	}
	
	getById(id){
		return this.drawHashMap[id];
	}
	
	fillGrid(callback){
		for(let i = 0; i < this.width; i += this.grid.x)
			for(let j = 0; j < this.height; j += this.grid.y)
				callback.call(this, i, j);
	}
	
	toGridCord(obj){
		return {
			x: Math.floor((obj.x1 - this.gridOffset.x) / this.grid.x),
			y: Math.floor((obj.y1 - this.gridOffset.y) / this.grid.y),
		};
	}
	
	getGridCount(){
		return {
			x: Math.floor(this.width / this.grid.x),
			y: Math.floor(this.height / this.grid.y),
		};
	}
	
	setGridSize(gx, gy = null){
		if(gy === null) gy = gx;
		
		this.grid.x = gx;
		this.grid.y = gy;
		
		this.gridOffset.x = Math.floor((this.width % this.grid.x) / 2);
		this.gridOffset.y = Math.floor((this.height % this.grid.y) / 2);
		
		if(this.ongridchange instanceof Function)
			this.ongridchange.call(this, this.grid, this.gridOffset, this.getGridCount());
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
	
	setArc(arcStart = 0, arcEnd = Math.PI * 2){
		this.arcStart = arcStart;
		this.arcEnd = arcEnd;
	}
	
	setBrushFont(font){
		this.brushFont = font;
	}
	
	setBrushAlign(align){
		this.brushAlign = align;
	}
	
	setBrushText(text){
		this.brushText = text;
	}
	
	
	startUndo(){
		this.currUndo = [];
	}
	
	endUndo(){
		if(!this.currUndo.length) return;
		
		this.Undo[this.currUndoI++] = this.currUndo;
		this.currUndo = [];
	}
	
	save(){
		this.saveStack.push({
			gridOffset: this.gridOffset,
			grid: this.grid,
			isGridDraw: this.isGridDraw,
			gridColor: this.gridColor,
			gridWidth: this.gridWidth,
			
			brushSelect: this.brushSelect,
			brushSize: this.brushSize,
			brushWidth: this.brushWidth,
			brushColor: this.brushColor,
			brushText: this.brushText,
			brushFont: this.brushFont,
			brushAlign: this.brushAlign,
			
			arcStart: this.arcStart,
			arcEnd: this.arcEnd,
		});
	}
	
	restore(){
		let poped = this.saveStack.pop();
		
		if(poped){
			this.gridOffset = poped.gridOffset;
			this.grid = poped.grid;
			this.isGridDraw = poped.isGridDraw;
			this.gridColor = poped.gridColor;
			this.gridWidth = poped.gridWidth;
			
			this.brushSelect = poped.brushSelect;
			this.brushSize = poped.brushSize;
			this.brushWidth = poped.brushWidth;
			this.brushColor = poped.brushColor;
			this.brushText = poped.brushText;
			this.brushFont = poped.brushFont;
			this.brushAlign = poped.brushAlign;
			
			this.arcStart = poped.arcStart;
			this.arcEnd = poped.arcEnd;
		}
	}
	
	resize(width, height){
		this.clear();
		this.save();
			this.init(width, height);
		this.restore();
		this.setGridSize(this.grid.x, this.grid.y);
		this.saveStack = [];
	}
	
	clear(){
		this._cumbacker(function(i, j, obj){
			this.currUndo.push(Object.assign({ id: UCanvas.#draw_id++, delId: obj.id, link: obj, type: UCanvas.RECT.DELETE }, { isClear: true }));
			this._onBrushCallback(this.currUndo[this.currUndo.length - 1]);
			
			if(obj.ondestruct instanceof Function)
				obj.ondestruct.call(this, obj);
		});
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
		
		if(this.onclear instanceof Function)
			this.onclear.call(this);
	}
	
	_undoCallbacker(delta){
		for(let i = this.currUndoI - delta; i > this.currUndoI; i--){
			let undos = this.Undo[i - 1];
			
			for(let j = undos.length; j--;){
				let obj = undos[j];
				
				if(obj.type === UCanvas.RECT.DELETE){
					this._onBrushCallback(obj.link);
				}else{
					if(obj.ondestruct instanceof Function)
						obj.ondestruct.call(this, obj);
					
					this._onBrushCallback(Object.assign({ id: UCanvas.#draw_id++, delId: obj.id, link: obj, type: UCanvas.RECT.DELETE }, { isUndo: true }));
				}
			}
		}
		
		for(let i = this.currUndoI - delta; i < this.currUndoI; i++){
			let undos = this.Undo[i];
			
			for(let j = 0; j < undos.length; j++){
				let obj = undos[j];
				
				if(obj.type === UCanvas.RECT.DELETE){
					if(obj.link.ondestruct instanceof Function)
						obj.link.ondestruct.call(this, obj.link);
					
					this._onBrushCallback(obj);
				}else{
					this._onBrushCallback(obj);
				}
			}
		}
	}
	
	undo(){
		if(this.currUndo.length)
			this.endUndo();
		
		let lCurr = this.currUndoI;
		
		this.currUndoI--;
		this.currUndoI = Math.max(this.currUndoI, 0);
		
		this._undoCallbacker(this.currUndoI - lCurr);
	}
	
	redo(){
		let lCurr = this.currUndoI;
		
		this.currUndoI++;
		this.currUndoI = Math.min(this.currUndoI, this.Undo.length);
		
		this._undoCallbacker(this.currUndoI - lCurr);
	}
}