import { Entity_base } from './Entity_base.js';
import { Vector } from '../../../_helpers/Vector.js';
import { Marker_home } from './Marker_home.js';
import { Marker_food } from './Marker_food.js';
import { Marker } from './Marker.js';
import { Food } from './Food.js';

export class Ant_base extends Entity_base{
	constructor(world, pos = new Vector(0, 0), speed = new Vector(0, 100)){
		super(world, pos, speed);
		
		// this.marker_detect_dist = 40;
		this.direction_update_per = 0.25;
		this.marker_per = 0.25;
		this.direction_noise = Math.PI * 0.02;
		this.repellent_period = 128;
		
		// this.weigth = 3;
		// this.height = 4.7;
		
		this.hasFood = false;
		
		this.size = new Vector(10, 3).mul(2);
		this.noise_seed = 0;
	}
	
	/*
		Когда муравей возращается маркеры домой деградируют на коффециент
	*/
	
	pickupFood(Hit){
		if(Hit.hitEntity instanceof Food){
			this.hasFood = true;
			Hit.hitEntity.stack--;
		}
	}
	
	// checkFood(){
		
	// }
	
	logicBioMarker(){
		let samples = 32;
		let findAng = 0.5 * Math.PI;
		
		// for() /* Семплирования, остановился тут */
			let RDirection = (new Vector(0)).randomize(new Vector(1)).normalize();
			let Hit;
			let CMarker = this.hasFood ? Marker_home : Marker_food;
			
			if(!(Hit = this.world.trace(this.getPos().add(RDirection.mul(2)), RDirection.mul(5), CMarker, this, false)).isRangeOut && Hit.hitEntity != null)
				this.speed = RDirection.mul(this.speed.length());
	}
	
	placeBioMarker(Hit){
		if(this.hasFood)
			new Marker_food(this.world, Hit.pos, 90);
		else
			new Marker_home(this.world, Hit.pos, 90);
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
		
	}
	
	tick(deltaT){
		if(this.speed.isZero()) return;
		
		this.logicBioMarker();
		
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
		this.placeBioMarker(Hit);
	}
}