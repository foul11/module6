import { Entity_stackable } from './Entity_stackable.js';
import { Marker } from './Marker.js';

export class Marker_food extends Marker{
	constructor(...args){
		super(...args);
		this.color = 120;
	}
}