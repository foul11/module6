import { Entity_stackable } from './Entity_stackable.js';
import { Vector } from '../../../_helpers/Vector.js';

export class Marker extends Entity_stackable{
	constructor(world, pos, chance, slice, minStack = 0, maxStack = 10, ...args){
		super(world, pos, chance, slice, minStack, maxStack, 3, ...args);
		this.color = 240;
		this.defaultDegradate = 0.98;
	}
	
	render(deltaT, ctx, width, height){
		// super.render(deltaT, ctx, width, height);
		// ctx.fillStyle = this._hsv2rgb(240 - Math.min(this.stack, 120), 1, 1);
		ctx.fillStyle = this._hsv2rgb(this.color, 0.85, (this.stack / this.maxStack) * 0.75 + 0.25);
		
		let size = 2;
		
		ctx.beginPath();
			ctx.arc(...this.getPos().sub((new Vector(size)).div(2)).floor(), size, 0, 2 * Math.PI);
		ctx.fill();
	}
	
	tick(deltaT){
		this.stack *= this.defaultDegradate ** deltaT;
		
		super.tick(deltaT);
	}
}