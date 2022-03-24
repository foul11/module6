import { Entity_stackable } from './Entity_stackable.js';
import { Marker } from './Marker.js';

export class Marker_home extends Marker{
	constructor(...args){
		super(...args);
		this.color = 0;
	}
}