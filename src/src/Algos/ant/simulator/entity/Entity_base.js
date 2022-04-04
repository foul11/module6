import { Vector } from '../../../_helpers/Vector.js';

export class Entity_base{
	static #create_id = 0;
	
	#pos;
	
	constructor(world, pos = new Vector(0, 0), speed = new Vector(0, 0)){
		this.id = Entity_base.#create_id++;
		
		this.speed = speed;
		this.#pos = pos;
		this.world = world;
		
		this.isCollide = false;
		this.ondestruct;
		
		this._UpdateInWorldMap(pos);
		this.world.setEntityProp(this);
	}
	
	_UpdateInWorldMap(NPos, LPos = null){ /* TODO: добавить многомерность ентитей */
		if(LPos){
			let LPos1 = LPos.floor();
			let LPos16 = LPos1.div(16).floor();
			let LPos32 = LPos1.div(32).floor();
			
			delete this.world.Map1[LPos1.x][LPos1.y].inObj[this.id];
			delete this.world.Map16[LPos16.x][LPos16.y].inObj[this.id];
			delete this.world.Map32[LPos32.x][LPos32.y].inObj[this.id];
		}
		
		if(!this.world._isOutWorld(NPos)){
			let NPos1 = NPos.floor();
			let NPos16 = NPos1.div(16).floor();
			let NPos32 = NPos1.div(32).floor();
			
			this.world.Map1[NPos1.x][NPos1.y].inObj[this.id] = this;
			this.world.Map16[NPos16.x][NPos16.y].inObj[this.id] = this;
			this.world.Map32[NPos32.x][NPos32.y].inObj[this.id] = this;
		}
	}
	
	setPos(pos){
		this._UpdateInWorldMap(pos, this.#pos);
		this.#pos = pos;
	}
	
	getPos(){
		return this.#pos;
	}
	
	rotate(ang){
		this.speed = this.speed.rotate(ang);
	}
	
	render(deltaT, ctx, width, height){
		let pos = this.#pos.floor();
		
		let size = new Vector(10);
		
		ctx.fillStyle = 'gray';
		ctx.fillRect(...pos.sub(size.div(2)), ...size);
		
		if(this.speed.isZero()) return;
		
		let move = this.speed.div(10);
		let move_n = move.normalize();
		
		let sVec = pos.add(move_n.mul(size));
		let eVec = sVec.add(move);
		let rVec = move_n.inv().mul(size.div(2));
		
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		
		ctx.beginPath();
			ctx.moveTo(...sVec);
			ctx.lineTo(...eVec);
			ctx.lineTo(...eVec.add(rVec.rotateDeg(45)));
			ctx.lineTo(...eVec.add(rVec.rotateDeg(-45)));
			ctx.lineTo(...eVec);
		ctx.stroke();
	}
	
	tick(deltaT){
		if(this.speed.isZero()) return;
		
		let Hit;
		let Direct = this.speed.mul(deltaT);
		
		if(!(Hit = this.world.trace(this.#pos, Direct, '', this)).isRangeOut){
			if(!Hit.normal.length()) return;
			
			this.speed = this.speed.sub(this.speed.projectOnto(Hit.normal).mul(2));
			Direct = this.speed.mul(deltaT);
		}
		
		if(!(Hit = this.world.trace(this.#pos, Direct, '', this)).isRangeOut)
			return;
		
		this.setPos(Hit.pos);
	}
	
	destruct(){
		if(this.ondestruct instanceof Function)
			this.ondestruct.call(this);
		
		this.world.setEntityProp(this, { draw: false, tick: false });
		
		let pos1 = this.#pos.floor();
		let pos16 = pos1.div(16).floor();
		let pos32 = pos1.div(32).floor();
		
		delete this.world.Map1[pos1.x]?.[pos1.y]?.inObj[this.id];
		delete this.world.Map16[pos16.x]?.[pos16.y]?.inObj[this.id];
		delete this.world.Map32[pos32.x]?.[pos32.y]?.inObj[this.id];
		
		this.#pos = null;
		delete this.speed;
	}
}