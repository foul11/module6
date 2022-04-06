import { World } from './simulator/world/World.js';
import { Entity_base } from './simulator/entity/Entity_base.js';
import { Ant_base } from './simulator/entity/Ant_base.js';
import { Food } from './simulator/entity/Food.js';
import { Marker_food } from './simulator/entity/Marker_food.js';
import { Marker_home } from './simulator/entity/Marker_home.js';
import { Wall } from './simulator/entity/Wall.js';
import { Colony } from './simulator/entity/Colony.js';
import { Vector } from '../_helpers/Vector.js';
import { Figure } from '../_helpers/Figure.js';

export class Algo_Ant{
	constructor(width, height){
		this.onstart = null;
		this.onend = null;
		
		this.ondraw = null;
		
		this.ondestruct = null;
		
		this.init(width, height);
	}
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		let deltaT = 0;
		
		while(true){
			this.world.tick(deltaT);
			this.world.render(deltaT);
			
			deltaT = yield;
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	resize(width, height){
		let confSCM = this.world.SCM;
		let confRenderDisabled = this.world.renderDisabled;
		let confTickDisabled = this.world.tickDisabled;
		
		this.world.destruct();
		this.init(width, height);
		
		this.world.SCM = confSCM;
		this.world.renderDisabled = confRenderDisabled;
		this.world.tickDisabled = confTickDisabled;
		
		return this;
	}
	
	init(width, height){
		this.world = new World(width, height);
		this.world.ondraw = (deltaT, ctx, width, height) => {
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ctx);
		};
		
		for(let i = 0; i < 1; i++){
			let ent5 = new Ant_base(this.world);
			
			ent5.setPos((new Vector(0,0)).randomize(new Vector(width, height)));
			
			// ent5.speed.x = 120;
			// ent5.speed.y = 200;
		}
		
		// for(let i = 0; i < 10000; i++){
			// let ent5 = new Food(this.world, (new Vector(100,100)).randomize(new Vector(width / 16 + 100, height / 16 + 100)));
			
			// ent5.speed.x = 120;
			// ent5.speed.y = 120;
		// }
		
		// console.log(this.world.trace(new Vector(482, 200), new Vector(123.22567828474871, 790.7337744514194)));
		// console.log(this.world.trace(new Vector(783.3512, 210.17), new Vector(784.0217991873466, 210.1149655319573)));
		
		// let perf = performance.now();
		// for(let i = 0; i < 10000; i++){
			// this.world.checkByChunkPos(new Vector(100, 100), 100, 'food', null, 'Map32');
		// }
		// console.log(performance.now() - perf);
	}
	
	_figureCallbacker(x1, y1, x2, y2, size, type, callback){
		switch(type){
			case 'circle':
				// Figure.circle(x, y, size, callback);
				Figure.circle(x1, y1, size, callback);
				Figure.line(x1, y1, x2, y2, size * 2.75, callback);
				Figure.circle(x2, y2, size, callback);
				break;
				
			case 'square':
				throw Error('PI');
				// Figure.square(x1, y1, size, callback);
				break;
		}
	}
	
	_nameToClass(entity){
		switch(entity){
			case 'Food':
				return Food;
				break;
			
			case 'Wall':
				return Wall;
				break;
			
			case 'Colony':
				return Colony;
				break;
			
			case 'Ant_base':
				return Ant_base;
				break;
			
			case 'Marker_food':
				return Marker_food;
				break;
			
			case 'Marker_home':
				return Marker_home;
				break;
			
			case 'Entity_base':
				return Entity_base;
				break;
		}
	}
	
	getSettings(name){
		switch(name){
			case 'colonyDefAnts':
				return Colony.defMaxSpawn;
				break;
		}
	}
	
	setSettings(name, val){
		switch(name){
			case 'colonyDefAnts':
				Colony.defMaxSpawn = val;
				break;
		}
	}
	
	superConfigurableMode(en){
		this.world.SCM = en;
	}
	
	disableRenderer(entity, opt){
		this.world.disableRenderer(this._nameToClass(entity), opt);
	}
	
	disableTicker(entity, opt){
		this.world.disableTicker(this._nameToClass(entity), opt);
	}
	
	algo_path(path){
		Ant_base.PATH_ALGO = path;
	}
	
	spawn(x1, y1, x2, y2, size, entity, type = 'circle'){
		[x1, x2, y1, y2] = [x1, x2, y1, y2].map((curr) => Math.floor(curr));
		
		entity = this._nameToClass(entity);
		
		this._figureCallbacker(x1, y1, x2, y2, size, type, (x, y) => {
			let SpawnPos = new Vector(x, y);
			
			if(!this.world._isOutWorld(SpawnPos))
				new entity(this.world, SpawnPos, 90);
		});
	}
	
	erase(x1, y1, x2, y2, size, filter = '', type = 'circle'){
		[x1, x2, y1, y2] = [x1, x2, y1, y2].map((curr) => Math.floor(curr));
		
		this._figureCallbacker(x1, y1, x2, y2, size, type, (x, y) => {
			let pos = new Vector(x, y);
			let ents = this.world.getByChunkPos(pos, 0, filter, null, 'Map1');
			
			Wall.destruct(this.world, pos);
			
			for(let i in ents){
				ents[i].destruct();
			}
		});
	}
	
	destruct(){
		if(this.ondestruct instanceof Function)
			this.ondestruct.call(this);
		
		this.world.destruct();
	}
}