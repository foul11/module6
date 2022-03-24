class _Vector{
	constructor(x = 0, y = null){
		if(y === null){
			this.x = this.y = x;
		}else{
			this.x = x;
			this.y = y;
		}
	}
	
	addX(x){ this.x += x.x; return this; }
	addXs(x){ this.x += x; return this; }
	
	addY(y){ this.y += x.y; return this; }
	addYs(y){ this.y += y; return this; }
	
	add(vec){ this.x += vec.x; this.y += vec.y; return this; }
	adds(vec){ this.x += vec; this.y += vec; return this; }
	
	
	subX(x){ this.x -= x.x; return this; }
	subXs(x){ this.x -= x; return this; }
	
	subY(y){ this.y -= x.y; return this; }
	subYs(y){ this.y -= y; return this; }
	
	sub(vec){ this.x -= vec.x; this.y -= vec.y; return this; }
	subs(vec){ this.x -= vec; this.y -= vec; return this; }
	
	
	divX(x){ this.x /= x.x; return this; }
	divXs(x){ this.x /= x; return this; }
	
	divY(y){ this.y /= x.y; return this; }
	divYs(y){ this.y /= y; return this; }
	
	div(vec){ this.x /= vec.x; this.y /= vec.y; return this; }
	divs(vec){ this.x /= vec; this.y /= vec; return this; }
	
	
	mulX(x){ this.x *= x.x; return this; }
	mulXs(x){ this.x *= x; return this; }
	
	mulY(y){ this.y *= x.y; return this; }
	mulYs(y){ this.y *= y; return this; }
	
	mul(vec){ this.x *= vec.x; this.y *= vec.y; return this; }
	muls(vec){ this.x *= vec; this.y *= vec; return this; }
	
	
	invX(){ this.x *= -1; return this; }
	invY(){ this.y *= -1; return this; }
	inv(){ this.x *= -1; this.y *= -1; return this; }
	
	normalize(){ this.divs(this.length()); return this; }
	
	limit(max, factor){
		if(Math.abs(this.x) > max){ this.x *= factor; }
		if(Math.abs(this.y) > max){ this.y *= factor; }
		
		return this;
	}
	
	randomize(vec){
		this.x = this.random(Math.min(this.x, vec.x), Math.max(this.x, vec.x));
		this.y = this.random(Math.min(this.y, vec.y), Math.max(this.y, vec.y));
		
		return this;
	}
	
	randomizeX(vec1, vec2){
		this.x = this.random(Math.min(vec1.x, vec2.x), Math.max(vec1.x, vec2.x));
		
		return this;
	}
	
	randomizeY(vec1, vec2){
		this.y = this.random(Math.min(vec1.y, vec2.y), Math.max(vec1.y, vec2.y));	
		
		return this;
	}
	
	randomizeAny(vec1, vec2){
		if(!!Math.round(Math.random()))
			return this.randomizeX(vec1, vec2);
		else
			return this.randomizeY(vec1, vec2);
	}
	
	round(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		
		return this;
	}
	
	floor(){
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		
		return this;
	}
	
	ceil(){
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		
		return this;
	}
	
	log2(){
		this.x = Math.log2(this.x);
		this.y = Math.log2(this.y);
		
		return this;
	}
	
	log(){
		this.x = Math.log(this.x);
		this.y = Math.log(this.y);
		
		return this;
	}
	
	exp(){
		this.x = Math.exp(this.x);
		this.y = Math.exp(this.y);
		
		return this;
	}
	
	toFixed(precision = 8){
		this.x = this.x.toFixed(precision);
		this.y = this.y.toFixed(precision);
		
		return this;
	}
	
	mixX(vec, amount = 0.5){
		this.x = (1 - amount) * this.x + amount * vec.x;
		
		return this;
	}
	
	mixY(vec, amount = 0.5){
		this.y = (1 - amount) * this.y + amount * vec.y;
		
		return this;
	}
	
	mix(vec, amount = 0.5){
		this.x = (1 - amount) * this.x + amount * vec.x;
		this.y = (1 - amount) * this.y + amount * vec.y;
		
		return this;
	}
	
	dot(vec){
		return this.x * vec.x + this.y * vec.y;
	}
	
	cross(vec){
		return this.x * vec.y - this.y * vec.x;
	}
	
	projectOnto(vec){
		let coeff = this.dot(vec) / vec.dot(vec);
		
		this.x = vec.x * coeff;
		this.y = vec.y * coeff;
		
		return this;
	}
	
	horizontalAngle(){
		return Math.atan2(this.x, this.y);
	}
	
	verticalAngle(){
		return Math.atan2(this.y, this.x);
	}
	
	horizontalAngleDeg(){
		return this.rad2deg(Math.atan2(this.x, this.y));
	}
	
	verticalAngleDeg(){
		return this.rad2deg(Math.atan2(this.y, this.x));
	}
	
	rotate(ang){
		let cs = Math.cos(ang);
		let sn = Math.sin(ang);
		
		let x = this.x * cs - this.y * sn;
		let y = this.x * sn + this.y * cs;
		
		this.x = x;
		this.y = y;
		
		return this;
	}
	
	rotateDeg(ang){
		return this.rotate(this.deg2rad(ang));
	}
	
	rotateTo(ang){
		return this.rotate(ang - this.horizontalAngle());
	}
	
	rotateToDeg(ang){
		return this.rotate(this.deg2rad(ang) - this.horizontalAngle());
	}
	
	rotateBy(ang){
		return this.rotate(ang + this.ang());
	}
	
	rotateByDeg(ang){
		return this.rotate(this.deg2rad(ang) + this.ang());
	}
	
	distX(vec){ return this.x - vec.x; }
	distXabs(vec){ return Math.abs(this.x - vec.x); }
	
	distY(vec){ return this.y - vec.y; }
	distYabs(vec){ return Math.abs(this.y - vec.y); }
	
	dist(vec){ return Math.sqrt(this.distX(vec) ** 2 + this.distY(vec) ** 2); }
	
	length(){ return Math.sqrt(this.x ** 2 + this.y ** 2); }
	
	isZero(){ return this.x === 0 && this.y === 0; }
	isEqual(vec){ return this.x === vec.x && this.y === vec.y; }
	
	toString(){ return '[x:' + this.x + ', y:' + this.y + ']'; }
	toArray(){ return [this.x, this.y]; }
	toObject(){ return { x: this.x, y: this.y }; }

	random(min, max){ return Math.random() * (max - min) + min; }

	rad2deg(rad){ return rad * _degrees; }
	deg2rad(deg){ return deg / _degrees; }
	
	clone(){ return new Vector_(this.x, this.y); }
	
	*[Symbol.iterator](){
		yield this.x;
		yield this.y;
	}
}

const _degrees = 180 / Math.PI;

export let Vector_ = _Vector;

// export function Vector(...args){
	// return new _Vector(...args);
// }