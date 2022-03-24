import { Entity_base } from './Entity_base.js';

export class Wall extends Entity_base{
	constructor(world, pos, ...args){
		pos = pos.floor();
		
		if(world._isOutWorld(pos)) return {};
		
		world.Map1[pos.x][pos.y].isWall = true;
		world.offscreenWallsBuffering.fillRect(...pos, 1, 1);
		
		return {};
	}
	
	static destruct(world, pos){
		pos = pos.floor();
		
		if(world._isOutWorld(pos)) return;
		
		world.Map1[pos.x][pos.y].isWall = false;
		world.offscreenWallsBuffering.clearRect(...pos, 1, 1);
	}
}