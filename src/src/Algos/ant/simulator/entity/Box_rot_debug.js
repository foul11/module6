import { Vector } from '../../../_helpers/Vector.js';
import { Entity_base } from './Entity_base.js';

export class Box_rot_debug extends Entity_base{
	constructor(world, color, p1, p2, p3, p4, ...args){
		super(world, new Vector(-1), ...args);
		
		this.color = color;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.p4 = p4;
	}
	
	render(deltaT, ctx, width, height){
		ctx.strokeStyle = this.color;
		// this.ctx.fillStyle = 'yellow';
		
		ctx.beginPath();
			ctx.moveTo(...this.p1);
			ctx.lineTo(...this.p2);
			ctx.lineTo(...this.p3);
			ctx.lineTo(...this.p4);
			ctx.lineTo(...this.p1);
		ctx.stroke();
		
		// this.ctx.fillRect(...box, 5, 5);
	}
	
	tick(deltaT){
		this.destruct();
	}
}