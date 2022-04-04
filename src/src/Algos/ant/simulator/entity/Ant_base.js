import { Entity_base } from './Entity_base.js';
import { Random } from '../../../_helpers/Random.js'
import { Vector } from '../../../_helpers/Vector.js';
import { Marker_home } from './Marker_home.js';
import { Marker_food } from './Marker_food.js';
import { Marker_debug } from './Marker_debug.js';
import { Box_debug } from './Box_debug.js';
import { Box_rot_debug } from './Box_rot_debug.js';
import { Marker } from './Marker.js';
import { Colony } from './Colony.js';
import { Food } from './Food.js';

import { Config } from '../../../../Config.js';

export class Ant_base extends Entity_base{
	static PATH_ALGO = 1;
	
	constructor(world, pos = new Vector(0, 0), speed = new Vector(0, 100)){
		super(world, pos, speed);
		
		// this.marker_detect_dist = 40;
		// this.direction_update_per = 0.25;
		// this.marker_per = 0.25;
		// this.direction_noise = Math.PI * 0.02;
		// this.repellent_period = 128;
		
		this.ChBrkPath = Random.randF(0.001, 0.01);
		this.CurBioMarkerItsv = 0;
		
		// this.weigth = 3;
		// this.height = 4.7;
		
		this.hasFood = false;
		this.intesivity = 1;
		// this.degradeteIntesivity = 0.99;
		this.degradeteIntesivity = 0.1;
		this.timer = 0;
		
		this.size = new Vector(10, 3).mul(2);
		this.noise_seed = Random.randF(10);
		this.base = null;
		
		// this.isCollide = true;
		
		
		if(world.SCM)
			this.SCM = Config.add([
				{
					type: 'wrapper',
					child: [
						{
							type: 'string',
							value: '[Entity Ant_base('+ this.id +')]',
						},
					],
				},
			]);
		
		this.ctx; /* TEMP */
	}
	
	/*
		TODO: Когда муравей возращается маркеры домой деградируют на коффециент
	*/
	
	pickupFood(Hit){
		if(Hit.hitEntity instanceof Food){
			this.hasFood = true;
			this.intesivity = 1;
			
			this.speed = this.speed.rotate(Math.PI);
			
			Hit.hitEntity.stack--;
		}
	}
	
	// checkFood(){
		
	// }
	
	logicBioMarker(deltaT){
		let samples = 32;
		let findAng = 0.25 * Math.PI;
		// let findAng = 2 * Math.PI;
		let findDist = 128;
		
		let CMarker = this.hasFood ? Marker_home : Marker_food;
		let SelBioMarker = null;
		
		if(this.timer <= 0 && Ant_base.PATH_ALGO == 1)
			for(let i=0; i < samples; i++){
				let RotAng = Random.rangeF(findAng);
				let NDirect = this.speed.normalize().rotate(RotAng);
				let Direct = NDirect.mul(Random.randF(findDist));
				let Hit = this.world.trace(this.getPos().add(NDirect.mul(2)), Direct, CMarker, this, false);
				
				if(Hit.isRangeOut) continue;
				
				if(SelBioMarker === null || (Hit.hitEntity !== null && SelBioMarker.stack < Hit.hitEntity.stack))
					SelBioMarker = Hit.hitEntity;
				
				this.timer = 0.1;
				// if(Random.attempt(this.ChBrkPath))
					// break;
				
				// let RDirection = (new Vector(0)).randomize(new Vector(1)).normalize();
				// let Hit;
				// let CMarker = this.hasFood ? Marker_home : Marker_food;
				
				// if(!(Hit = this.world.trace(this.getPos().add(RDirection.mul(2)), RDirection.mul(5), CMarker, this, false)).isRangeOut && Hit.hitEntity != null)
					// this.speed = RDirection.mul(this.speed.length());
			}
		
		// -TODO: можно попробовать искать в радиусе черивичка, складывать позиции всех найденых энтитей и делить на кол-во, в итоге получится средняя точка,  и в нее направоять червичка, если задать нельшой калдавн ваще заипца будет
		// -От муравья смотреть клетки, искать маркеры, отнимать позицию червика от позиции маркера (вектор направления), получившиеся вектор умножить на интенсивность маркера
		// -сложить все вектора вместе и взять нормаль, должен получится правильный вектор движения
		
		if(Ant_base.PATH_ALGO == 2){
			let ents = this.world.getByChunkPos(this.getPos(), findDist, CMarker, this);
			let FoodsEnts = this.world.getByChunkPos(this.getPos(), findDist, Food, this);
			
			if(FoodsEnts.length && this.timer <= 0 && !this.hasFood){
				this.speed = FoodsEnts[Random.randI(0, FoodsEnts.length - 1)].getPos().sub(this.getPos()).normalize().mul(this.speed.length());
				this.timer = 0.4;
			}else{
				let VSum = new Vector(0);
				
				for(let i in ents){
					VSum = VSum.add(ents[i].getPos().sub(this.getPos()).mul(ents[i].stack));
				}
				
				if(!VSum.isZero() && this.timer <= 0 && Random.attempt(0.333)){
					this.speed = VSum.normalize().mul(this.speed.length());
					this.timer = 0.8;
				}
			}
		}
		
		this.timer = Math.max(0, this.timer - deltaT);
		
		// let ents = this.world.getByChunkPos(this.getPos().add(this.speed.normalize().mul(findDist / 1.8)), findDist / 2, CMarker, this);
		
		// for(let i in ents){
			// if(SelBioMarker === null || SelBioMarker.stack < ents[i].stack){
				// SelBioMarker = ents[i];
			// }
		// }
		
		if(SelBioMarker !== null && SelBioMarker.stack > this.CurBioMarkerItsv/*Random.attempt((SelBioMarker.stack - this.CurBioMarkerItsv))*/){
			this.CurBioMarkerItsv = SelBioMarker.stack;
			this.speed = SelBioMarker.getPos().sub(this.getPos()).normalize().mul(this.speed.length()); //this.speed.rotate(this.speed.toAngle() + ().toAngle());
		}
		
		if(this.ctx && SelBioMarker){
			let debug = new Marker_debug(this.hasFood ? 60 : 300, this.world, SelBioMarker.getPos(), 0, 10, 0.005);
			
			if(debug instanceof Marker_debug)
				debug.defaultDegradate = 0.3;
			// console.log(this.getPos().dist(SelBioMarker.getPos()));
			// this.ctx.fillStyle = 'yellow';
			// this.ctx.fillRect(...SelBioMarker.getPos(), 20, 20);
			// console.log('da');
		}
		
		if(this.ctx){
			let box = this.getPos();
			let boxAdd = new Vector(findDist / 2);
			
			let ang = this.speed.toAngle();
			
			let p1 = box.add(boxAdd.rotate(ang));
			let p2 = box.add(boxAdd.invX().rotate(ang));
			let p3 = box.add(boxAdd.inv().rotate(ang));
			let p4 = box.add(boxAdd.invY().rotate(ang));
			
			// new Box_rot_debug(this.world, 'yellow', p1, p2, p3, p4);
			
			// this.ctx.save();
				// this.ctx.strokeStyle = 'yellow';
				// this.ctx.fillStyle = 'yellow';
				
				// this.ctx.beginPath();
					// this.ctx.moveTo(...box.add(boxAdd));
					// this.ctx.lineTo(...box.add(boxAdd.invX()));
					// this.ctx.lineTo(...box.add(boxAdd.inv()));
					// this.ctx.lineTo(...box.add(boxAdd.invY()));
					// this.ctx.lineTo(...box.add(boxAdd));
				// this.ctx.stroke();
				
				// this.ctx.fillRect(...box, 5, 5);
			// this.ctx.restore();
		}
		
		this.CurBioMarkerItsv *= (0.3 ** deltaT);
		
		// if(this.world.checkByChunkPos(this.getPos(), 2, Colony, this))
			// this.hasFood = false;
	}
	
	placeBioMarker(Hit, deltaT){
		let CMarker;
		
		if(this.hasFood)
			CMarker = new Marker_food(this.world, Hit.pos, 0, this.intesivity, 0.005);
		else
			CMarker = new Marker_home(this.world, Hit.pos, 0, this.intesivity, 0.005, 3);
		
		// if(CMarker instanceof Marker)
			// CMarker.stack *= this.intesivity;
		
		// this.intesivity = Math.max(this.intesivity * (this.degradeteIntesivity ** deltaT), 0);
		this.intesivity = Math.max(this.intesivity - (this.degradeteIntesivity * deltaT), 0);
	}
	
	getBioMarkerIntensity(){
		
	}
	
	render(deltaT, ctx, width, height){
		let pos = this.getPos().floor();
		let ang = this.speed.normalize().toAngle();
		let size = this.size;
		
		let sizeXR = size.div(2).setY(0).rotate(ang);
		let sizeYR = size.div(2).setX(0).rotate(ang);
		
		let size2R = sizeXR.add(sizeYR);
		let size2IR = sizeXR.add(sizeYR.inv());
		
		let p1 = pos.sub(size2R);
		let p2 = pos.sub(size2IR);
		let p3 = pos.add(size2R);
		let p4 = pos.add(size2IR);
		
		ctx.fillStyle = 'gray';
		
		ctx.beginPath();
			ctx.moveTo(...p1);
			ctx.lineTo(...p2);
			ctx.lineTo(...p3);
			ctx.lineTo(...p4);
		ctx.fill();
		
		this.ctx = ctx;/* TEMP */
		
		// ctx.beginPath();
			// ctx.moveTo(...end);
			// ctx.lineTo(...start);
			
			// ctx.moveTo(...center);
			// ctx.lineTo(...center.sub(ptl));
			// ctx.moveTo(...center);
			// ctx.lineTo(...center.sub(ptr));
			
			// ctx.moveTo(...end);
			// ctx.lineTo(...end.sub(ptl));
			// ctx.moveTo(...end);
			// ctx.lineTo(...end.sub(ptr));		
			
			// ctx.moveTo(...start);
			// ctx.lineTo(...start.sub(ptl));
			// ctx.moveTo(...start);
			// ctx.lineTo(...start.sub(ptr));
		// ctx.stroke();
		super.render(...arguments);
	}
	
	tick(deltaT){
		if(this.speed.isZero()) return;
		
		this.logicBioMarker(deltaT);
		
		function random_noise_sin(x){
			return -0.143 * Math.sin(1.75 * (x + 1.73)) - 0.180 * Math.sin(2.96 * (x + 4.98)) - 0.012 * Math.sin(6.23 * (x + 3.17)) + 0.088 * Math.sin(8.07 * (x + 4.63));
		}
		
		this.speed = this.speed.rotate(random_noise_sin(this.noise_seed += Vector.random(0.001, 0.01)) / 40);
		
		let Hit;
		let Direct = this.speed.mul(deltaT);
		
		if(!(Hit = this.world.trace(this.getPos(), Direct, 'Food', this)).isRangeOut && Hit.hitEntity != null)
			this.pickupFood(Hit);
		
		if(!(Hit = this.world.trace(this.getPos(), Direct, '', this)).isRangeOut){
			if(!Hit.normal.length()) return;
			
			this.speed = this.speed.sub(this.speed.projectOnto(Hit.normal).mul(2));
			Direct = this.speed.mul(deltaT);
		}
		
		if(!(Hit = this.world.trace(this.getPos(), Direct, '', this)).isRangeOut)
			return;
		
		this.setPos(Hit.pos);
		this.placeBioMarker(Hit, deltaT);
		
		if(this.base && this.base !== null)
			if(this.base.getPos().dist(this.getPos()) < 30 && this.hasFood){
				this.hasFood = false;
				this.intesivity = 0.5;
				
				this.speed = this.speed.rotate(Math.PI);
			}
	}
}