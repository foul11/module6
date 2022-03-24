import { Entity_stackable } from './Entity_stackable.js';
import { Vector } from '../../../_helpers/Vector.js';

export class Food extends Entity_stackable{
	constructor(world, pos, chance, maxStack = 120, ...args){
		super(world, pos, chance, maxStack, 3, ...args);
		this.isCollide = true;
	}
	
	render(deltaT, ctx, width, height){
		ctx.fillStyle = this._hsv2rgb(240 - Math.min(this.stack, 120), 1, 1);
		
		let size = 3;
		
		ctx.beginPath();
		ctx.arc(...this.getPos().sub((new Vector(size)).div(2)).floor(), size, 0, 2 * Math.PI);
		ctx.fill();
	}
}