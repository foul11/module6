class _Vector{
	constructor(x = 0, y = null){
		if(y === null){
			this.x = this.y = x;
		}else{
			this.x = x;
			this.y = y;
		}
	}
	
	// constructor(x, y = null){
		// if(x instanceof Object){
			// if(x instanceof Array){
				// this.x = x[0] || 0;
				// this.y = x[1] || 0;
				
				// return;
			// }
			
			// if (x.y !== undefined) this.y = x.y || 0;
			// if (x.x !== undefined) this.x = x.x || 0;
			
			// return;
		// }

		// if(y == null){
			// this.x = this.y = x || 0;
		// }else{
			// this.x = x || 0;
			// this.y = y || 0;
		// }
	// }
	
	addX(x){
		if(x instanceof _Vector)
			return new _Vector(this.x + x.x, this.y);
		else
			return new _Vector(this.x + x, this.y);
	}
	
	addY(y){
		if(y instanceof _Vector)
			return new _Vector(this.x, this.y + y.y);
		else
			return new _Vector(this.x, this.y + y);
	}
	
	add(vec){
		if(vec instanceof _Vector)
			return new _Vector(this.x + vec.x, this.y + vec.y);
		else
			return new _Vector(this.x + vec, this.y + vec);
	}
	
	
	subX(x){
		if(x instanceof _Vector)
			return new _Vector(this.x - x.x, this.y);
		else
			return new _Vector(this.x - x, this.y);
	}
	
	subY(y){
		if(y instanceof _Vector)
			return new _Vector(this.x, this.y - y.y);
		else
			return new _Vector(this.x, this.y - y);
	}
	
	sub(vec){
		if(vec instanceof _Vector)
			return new _Vector(this.x - vec.x, this.y - vec.y);
		else
			return new _Vector(this.x - vec, this.y - vec);
	}
	
	
	divX(x){
		if(x instanceof _Vector)
			return new _Vector(this.x / x.x, this.y);
		else
			return new _Vector(this.x / x, this.y);
	}
	
	divY(y){
		if(y instanceof _Vector)
			return new _Vector(this.x, this.y / y.y);
		else
			return new _Vector(this.x, this.y / y);
	}
	
	div(vec){
		if(vec instanceof _Vector)
			return new _Vector(this.x / vec.x, this.y / vec.y);
		else
			return new _Vector(this.x / vec, this.y / vec);
	}
	
	
	mulX(x){
		if(x instanceof _Vector)
			return new _Vector(this.x * x.x, this.y);
		else
			return new _Vector(this.x * x, this.y);
	}
	
	mulY(y){
		if(y instanceof _Vector)
			return new _Vector(this.x, this.y * y.y);
		else
			return new _Vector(this.x, this.y * y);
	}
	
	mul(vec){
		if(vec instanceof _Vector)
			return new _Vector(this.x * vec.x, this.y * vec.y);
		else
			return new _Vector(this.x * vec, this.y * vec);
	}
	
	
	invX(){
		return new _Vector(this.x * -1, this.y);
	}
	
	invY(){
		return new _Vector(this.x, this.y * -1);
	}
	
	inv(){
		return new _Vector(this.x  * -1, this.y  * -1);
	}
	
	setX(x){ return new _Vector(x, this.y); }
	setY(y){ return new _Vector(this.x, y); }
	
	toAngle(){ return Math.atan2(this.y, this.x); }
	
	normalize(){
		if(this.length() === 0) return new _Vector(0, 0);
		return this.div(this.length());
	}
	
	limit(max, factor){
		let x = this.x;
		let y = this.y;
		
		if(Math.abs(x) > max){ x *= factor; }
		if(Math.abs(y) > max){ y *= factor; }
		
		return new _Vector(x, y);
	}
	
	randomize(vec){
		return new _Vector(
			_Vector.random(Math.min(this.x, vec.x), Math.max(this.x, vec.x)),
			_Vector.random(Math.min(this.y, vec.y), Math.max(this.y, vec.y)),
		);
	}
	
	randomizeX(vec1, vec2){
		return new _Vector(_Vector.random(Math.min(vec1.x, vec2.x), Math.max(vec1.x, vec2.x)), this.y);
	}
	
	randomizeY(vec1, vec2){
		return new _Vector(this.x, _Vector.random(Math.min(vec1.y, vec2.y), Math.max(vec1.y, vec2.y)));
	}
	
	randomizeAny(vec1, vec2){
		if(!!Math.round(Math.random()))
			return this.randomizeX(vec1, vec2);
		else
			return this.randomizeY(vec1, vec2);
	}
	
	round(){
		return new _Vector(Math.round(this.x), Math.round(this.y));
	}
	
	floor(){
		return new _Vector(Math.floor(this.x), Math.floor(this.y));
	}
	
	ceil(){
		return new _Vector(Math.ceil(this.x), Math.ceil(this.y));
	}
	
	log2(){
		return new _Vector(Math.log2(this.x), Math.log2(this.y));
	}
	
	log(){
		return new _Vector(Math.log(this.x), Math.log(this.y));
	}
	
	exp(){
		return new _Vector(Math.exp(this.x), Math.exp(this.y));
	}
	
	toFixed(precision = 8){
		return new _Vector(this.x.toFixed(precision), this.y.toFixed(precision));
	}
	
	mixX(vec, amount = 0.5){
		return new _Vector((1 - amount) * this.x + amount * vec.x, y);
	}
	
	mixY(vec, amount = 0.5){
		return new _Vector(x, (1 - amount) * this.y + amount * vec.y);
	}
	
	mix(vec, amount = 0.5){
		return new _Vector((1 - amount) * this.x + amount * vec.x, (1 - amount) * this.y + amount * vec.y);
	}
	
	dot(vec){
		return this.x * vec.x + this.y * vec.y;
	}
	
	cross(vec){
		return this.x * vec.y - this.y * vec.x;
	}
	
	projectOnto(vec){
		let coeff = this.dot(vec) / vec.dot(vec);
		return new _Vector(vec.x * coeff, vec.y * coeff);
	}
	
	horizontalAngle(){
		return Math.atan2(this.x, this.y);
	}
	
	verticalAngle(){
		return Math.atan2(this.y, this.x);
	}
	
	horizontalAngleDeg(){
		return _Vector.rad2deg(Math.atan2(this.x, this.y));
	}
	
	verticalAngleDeg(){
		return _Vector.rad2deg(Math.atan2(this.y, this.x));
	}
	
	// angle = this.horizontalAngle;
	// angleDeg = this.horizontalAngleDeg;
	// direction = this.horizontalAngle;
	
	rotate(ang){
		let cs = Math.cos(ang);
		let sn = Math.sin(ang);
		
		return new _Vector(
			this.x * cs - this.y * sn,
			this.x * sn + this.y * cs
		);
	}
	
	rotateDeg(ang){
		return this.rotate(_Vector.deg2rad(ang));
	}
	
	rotateTo(ang){
		return this.rotate(ang - this.horizontalAngle());
	}
	
	rotateToDeg(ang){
		return this.rotate(_Vector.deg2rad(ang) - this.horizontalAngle());
	}
	
	rotateBy(ang){
		return this.rotate(ang + this.ang());
	}
	
	rotateByDeg(ang){
		return this.rotate(_Vector.deg2rad(ang) + this.ang());
	}
	
	distX(vec){ return this.x - vec.x; }
	distXabs(vec){ return Math.abs(this.x - vec.x); }
	
	distY(vec){ return this.y - vec.y; }
	distYabs(vec){ return Math.abs(this.y - vec.y); }
	
	dist(vec){ return Math.sqrt(this.distX(vec) ** 2 + this.distY(vec) ** 2); }
	
	length(){ return Math.sqrt(this.x ** 2 + this.y ** 2); }
	
	isZero(){ return this.x === 0 && this.y === 0; }
	isEqual(vec){ return this.x === vec.x && this.y === vec.y; }
	isNaN(){ return isNaN(this.x) || isNaN(this.y); }
	
	toString(){ return '[x:' + this.x + ', y:' + this.y + ']'; }
	toArray(){ return [this.x, this.y]; }
	toObject(){ return { x: this.x, y: this.y }; }

	static random(min, max){ return Math.random() * (max - min) + min; }

	static rad2deg(rad){ return rad * _degrees; }
	static deg2rad(deg){ return deg / _degrees; }
	
	// clone(){ return this; }
	
	*[Symbol.iterator](){
		yield this.x;
		yield this.y;
	}
}

const _degrees = 180 / Math.PI;

export let Vector = _Vector;

// export function Vector(...args){
	// return new _Vector(...args);
// }