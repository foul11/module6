import { Entity_base } from './Entity_base.js';
import { Vector } from '../../../_helpers/Vector.js';
import { Ant_base } from './Ant_base.js';
import { Marker_home } from './Marker_home.js';
import { Marker_food } from './Marker_food.js';
import { Food } from './Food.js';

import { Config } from '../../../../Config.js';


export class Colony extends Entity_base{
	static #create_Colony_id = 0;
	static defMaxSpawn = 100;
	
	constructor(world, pos, ...arg){ /* TODO: on construct add config menu */
		if(!world.checkByChunkPos(pos, 10, 'Colony', null)){
			super(world, pos, ...arg);
		}else return {};
		
		this.maxAnt = Colony.defMaxSpawn;
		this.ants = 0;
		this.isCollide = true;
		this.Colony_id = Colony.#create_Colony_id++;
		
		this.SCM = Config.add([
			{
				type: 'wrapper-vert',
				child: [
					{
						type: 'string',
						value: '[Entity Colony('+ this.id +')]',
					},
					{
						type: 'horz',
						child: [
							
						],
					},
				],
			},
		]);
	}
	
	setPos(){}
	
	render(deltaT, ctx, width, height){
		ctx.fillStyle = 'red';
		
		let size = 10;
		
		ctx.beginPath();
			ctx.arc(...this.getPos().sub((new Vector(size)).div(2)).floor(), size, 0, 2 * Math.PI);
		ctx.fill();
	}
	
	tick(deltaT){
		if(this.ants < this.maxAnt){
			let rv = new Vector(20);
			let Ant = null;
			
			if((Ant = new Ant_base(this.world, this.getPos().add(rv.inv().randomize(rv)))) instanceof Ant_base){
				Ant.rotate(Vector.random(0, Math.PI * 2));
				Ant.ondestruct = () => { this.ants--; };
				Ant.base = this;
				
				this.ants++;
			}
		}
	}
}