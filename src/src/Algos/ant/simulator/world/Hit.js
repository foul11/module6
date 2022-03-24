export class Hit{
	constructor(pos, Lpos, hitEntity, isWorld, isRangeOut){
		this.pos = pos;
		this.normal = Lpos.sub(pos.floor()).normalize();
		this.hitEntity = hitEntity;
		this.isWorld = isWorld;
		this.isRangeOut = isRangeOut;
	}
}