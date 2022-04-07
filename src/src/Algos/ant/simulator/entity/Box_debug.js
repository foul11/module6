import { Entity_base } from './Entity_base.js';

export class Box_debug extends Entity_base{
	constructor(world, pos, size, ...args){
		super(world, pos, ...args);
		
		this.size = size;
	}
	
	render(deltaT, ctx, width, height){
		ctx.strokeStyle = 'yellow';
		// this.ctx.fillStyle = 'yellow';
		
		let box = this.getPos();
		let boxAdd = this.size;
		
		ctx.beginPath();
			ctx.moveTo(...box.add(boxAdd));
			ctx.lineTo(...box.add(boxAdd.invX()));
			ctx.lineTo(...box.add(boxAdd.inv()));
			ctx.lineTo(...box.add(boxAdd.invY()));
			ctx.lineTo(...box.add(boxAdd));
		ctx.stroke();
		
		// this.ctx.fillRect(...box, 5, 5);
	}
	
	tick(deltaT){
		this.destruct();
	}
}