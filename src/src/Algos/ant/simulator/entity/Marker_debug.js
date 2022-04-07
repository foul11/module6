import { Entity_stackable } from './Entity_stackable.js';
import { Marker } from './Marker.js';

export class Marker_debug extends Marker{
	constructor(color, ...args){
		super(...args);
		this.color = color;
	}
}