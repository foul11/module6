import { Entity_base } from './Entity_base.js';
import { Vector } from '../../../_helpers/Vector.js';

export class Entity_stackable extends Entity_base{
	
	constructor(world, pos, chance = 0, slice = 1, minStack = 0, maxStack = Infinity, stackRange = 5, ...args){
		if(pos === undefined) throw TypeError('pos is undefined');
		
		let ents = world.getByRange(pos, stackRange, new.target.name, null, 'Map16');
		
		if(Math.random() * 100 <= chance) return {};
		if(slice < minStack) return {};
		
		/* if(ents.length > 1){
			throw Error(new.target.name + ' not one from this pos ' + pos);
		}else */ if(ents.length){
			if(ents[0].stack < ents[0].maxStack){
				ents[0].stack = Math.min(ents[0].stack + slice, ents[0].maxStack);
				return ents[0];
			}
		}else{
			super(world, pos, ...args);
			
			this.minStack = minStack;
			this.maxStack = maxStack;
			this.stack = slice;
			
			return;
		}
		
		return {};
	}
	
	_hsv2rgb(h,s,v){
		let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);
		let format = (n) => Math.floor(n * 255).toString(16).padStart(2, '0');
		
		return '#' + format(f(5)) + format(f(3)) + format(f(1));
	}
	
	setPos(pos){}
	
	tick(deltaT){
		if(this.stack <= this.minStack)
			this.destruct();
	}
}