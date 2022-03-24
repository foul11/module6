import { Vector } from '../../../_helpers/Vector.js';
import { Figure } from '../Figure.js';
import { Hit } from './Hit.js';

export class World{
	constructor(width, height){
		this._refillMap(width, height);
		this.renderList = {};
		this.tickList = {};
		
		this.ondraw = null;
		this.ondestruct = null;
		
		this.offscreenCanvas = document.createElement('canvas');
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;
		
		this.offscreenWallsCanvas = document.createElement('canvas');
		this.offscreenWallsCanvas.width = width;
		this.offscreenWallsCanvas.height = height;
		
		this.width = width;
		this.height = height;
		
		this.offscreenBuffering = this.offscreenCanvas.getContext('2d', { alpha: false });
		this.offscreenWallsBuffering = this.offscreenWallsCanvas.getContext('2d');
		this.offscreenWallsBuffering.fillStyle = 'lightgrey';
	}
	/*
		Modifing:
			16 x 16 x 16
			 x     x      x
			16 x 16 x 16
			 x     x      x
			16 x 16 x 16
			
			1: adds grid 48x48 (max search 16x16) for alls entities (faster search)
			
			32 x 32 x 32
			 x      x      x
			32 x 32 x 32
			 x      x      x
			32 x 32 x 32
			
			2: adds grid 96x96 (max search 32x32) for ...
	*/
	
	_refillMap(width, height){
		this.Map1 = [];
		
		for(let x = 0; x < width; x++){
			this.Map1.push([])
			let Map1 = this.Map1[x];
			
			for(let y = 0; y < height; y++){
				Map1.push({
					isWall: false,
					inObj: {},
				});
			}
		}
		
		this.Map16 = [];
		
		let width16 = Math.ceil(width / 16);
		let height16 = Math.ceil(height / 16);
		
		for(let x = 0; x < width16; x++){
			this.Map16.push([])
			let Map16 = this.Map16[x];
			
			for(let y = 0; y < height16; y++){
				Map16.push({
					// isWall: false,
					inObj: {},
				});
			}
		}
		
		this.Map32 = [];
		
		let width32 = Math.ceil(width / 32);
		let height32 = Math.ceil(height / 32);
		
		for(let x = 0; x < width32; x++){
			this.Map32.push([])
			let Map32 = this.Map32[x];
			
			for(let y = 0; y < height32; y++){
				Map32.push({
					// isWall: false,
					inObj: {},
				});
			}
		}
	}
	
	_isOutWorld(vec){
		return vec.x < 0 || vec.y < 0 || Math.floor(vec.x) > (this.width - 1) || Math.floor(vec.y) > (this.height - 1);
	}
	
	/* Search function optimazed */
	
	_SelectSearchParam(range, SearchMap){
		let ceilRange = null;
		let Scale = null;
		let Maps = null;
		
		if(SearchMap === 'auto'){
			if(range >= 32){
				SearchMap = 'Map32';
			}else if(range >= 2){
				SearchMap = 'Map16';
			}else{
				SearchMap = 'Map1';
			}
		}
		
		switch(SearchMap){
			case 'Map1':
				ceilRange = Math.ceil(range);
				Maps = this.Map1;
				Scale = 1;
				break;
				
			case 'Map16':
				ceilRange = Math.ceil(Math.ceil(range) / 16);
				Maps = this.Map16;
				Scale = 16;
				break;
				
			case 'Map32':
				ceilRange = Math.ceil(Math.ceil(range) / 32);
				Maps = this.Map32;
				Scale = 32;
				break;
				
			case 'auto':
			default:
				throw Error('plz correct select maps to search');
				break;
		}
		
		return {
			ceilRange: ceilRange,
			Scale: Scale,
			Maps: Maps,
		}
	}
	
	getByRange(pos, range = 1, filter = '', self = null, SearchMap = 'auto'){
		let ret = [];
		
		let { ceilRange, Scale, Maps } = this._SelectSearchParam(range, SearchMap);
		let fPos = pos.div(Scale).floor();
		
		for(let x = -ceilRange; x <= ceilRange; x++)
			for(let y = -ceilRange; y <= ceilRange; y++){
				if(this._isOutWorld({ x: (x + fPos.x) * Scale, y: (y + fPos.y) * Scale })){ continue; }
				
				let objs = Maps[x + fPos.x][y + fPos.y].inObj;
				
				for(let i in objs){
					if(objs[i].getPos().dist(pos) <= range && objs[i] != self && (objs[i].constructor.name === filter || filter === '')){
						ret.push(objs[i]);
					}
				}
			}
		
		return ret;
	}
	
	getByChuckPos(pos, range = 1, filter = '', self = null, SearchMap = 'auto'){
		let ret = [];
		
		let { ceilRange, Scale, Maps } = this._SelectSearchParam(range, SearchMap);
		let fPos = pos.div(Scale).floor();
		
		for(let x = -ceilRange; x <= ceilRange; x++)
			for(let y = -ceilRange; y <= ceilRange; y++){
				if(this._isOutWorld({ x: (x + fPos.x) * Scale, y: (y + fPos.y) * Scale })){ continue; }
				
				let objs = Maps[x + fPos.x][y + fPos.y].inObj;
				
				for(let i in objs){
					if(objs[i] != self && (objs[i].constructor.name === filter || filter === '')){
						ret.push(objs[i]);
					}
				}
			}
		
		return ret;
	}
	
	checkByChunkPos(pos, range = 1, filter = '', self = null, SearchMap = 'auto'){
		let { ceilRange, Scale, Maps } = this._SelectSearchParam(range, SearchMap);
		let fPos = pos.div(Scale).floor();
		
		for(let x = -ceilRange; x <= ceilRange; x++)
			for(let y = -ceilRange; y <= ceilRange; y++){
				if(this._isOutWorld({ x: (x + fPos.x) * Scale, y: (y + fPos.y) * Scale })){ continue; }
				
				let objs = Maps[x + fPos.x][y + fPos.y].inObj;
				
				for(let i in objs){
					if(objs[i] != self && (objs[i].constructor.name === filter || filter === '')){
						return objs[i];
					}
				}
			}
		
		return false;
	}
	
	/* TODO: getRandomEntityFromRaduis */
	
	trace(pos, direction, filter = '', self = null, isCollide = true){
		let endPos = pos.add(direction);
		
		let step = 1;
		
		let x = Math.floor(pos.x);
		let y = Math.floor(pos.y);
		let diffX = endPos.x - pos.x;
		let diffY = endPos.y - pos.y;
		let stepX = Math.sign(diffX);
		let stepY = Math.sign(diffY);
		
		let xOffset = endPos.x > pos.x ? (Math.ceil(pos.x) - pos.x) : (pos.x - Math.floor(pos.x));
		let yOffset = endPos.y > pos.y ? (Math.ceil(pos.y) - pos.y) : (pos.y - Math.floor(pos.y));
		
		let angle = Math.atan2(-diffY, diffX);
		let tMaxX = xOffset / Math.cos(angle);
		let tMaxY = yOffset / Math.sin(angle);
		let tDeltaX = 1.0 / Math.cos(angle);
		let tDeltaY = 1.0 / Math.sin(angle);
		
		let Dist = Math.abs(Math.floor(endPos.x) - Math.floor(pos.x)) + Math.abs(Math.floor(endPos.y) - Math.floor(pos.y));
		
		let LLPos = new Vector(x, y);
		
		for(let t = 0; t <= Dist; t++){
			let LPos = new Vector(x, y);
				
			if(this._isOutWorld(LPos))
				return new Hit(LPos, LLPos, null, true, false);
			
			let cell = this.Map1[LPos.x][LPos.y];
			
			if(cell.isWall)
				return new Hit(LPos, LLPos, null, true, false);
			
			for(let i in cell.inObj)
				if(cell.inObj[i].isCollide === isCollide && cell.inObj[i] != self &&
					(cell.inObj[i].constructor.name === filter || filter === '' || filter instanceof Object && cell.inObj[i] instanceof filter))
					return new Hit(LPos, LLPos, cell.inObj[i], false, false);
			
			
			if (Math.abs(tMaxX) < Math.abs(tMaxY)) {
				tMaxX += tDeltaX;
				x += stepX;
			} else {
				tMaxY += tDeltaY;
				y += stepY;
			}
			
			LLPos = LPos;
		}
		
		return new Hit(endPos, LLPos, null, false, true);
	}
	
	/* END -- Search function optimazed -- END */
	
	render(deltaT){
		let ctx = this.offscreenBuffering;
		
		ctx.save();
		// ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
		
		for(let k in this.renderList){
			let item = this.renderList[k];
			
			ctx.save();
			item.render(deltaT, ctx, this.width, this.height);
			ctx.restore();
		}
		
		ctx.drawImage(this.offscreenWallsCanvas, 0, 0, this.width, this.height);
		
		if(this.ondraw instanceof Function)
			this.ondraw.call(this, deltaT, ctx, this.width, this.height);
	}
	
	setEntityProp(Entity, opts = { draw: true, tick: true }){
		if(opts.draw)
			this.renderList[Entity.id] = Entity;
		else
			delete this.renderList[Entity.id];
		
		if(opts.tick)
			this.tickList[Entity.id] = Entity;
		else
			delete this.tickList[Entity.id];
	}
	
	tick(deltaT){
		for(let k in this.tickList){
			let item = this.tickList[k];
			
			item.tick(deltaT / 1000);
		}
	}
	
	destruct(){
		if(this.ondestruct instanceof Function)
			this.ondestruct.call(this);
		
		for(let k in this.renderList){
			this.renderList[k].destruct();
		}
		
		for(let k in this.tickList){
			this.tickList[k].destruct();
		}
	}
}