export class Random{
	static randF(min = Number.MAX_VALUE, max = Number.MAX_VALUE){
		if(min === max && min === Number.MAX_VALUE) min = 0;
		if(min !== max && max === Number.MAX_VALUE) max = min, min = 0;
		
		return Math.random() * (max - min) + min;
	}
	
	static randI(min = Number.MAX_VALUE, max = Number.MAX_VALUE){
		return Math.floor(Random.randF(min, max));
	}
	
	static rangeF(val = Number.MAX_VALUE){
		return Random.randF(-val, val);
	}
	
	static rangeI(val = Number.MAX_VALUE){
		return Random.randI(-val, val);
	}
	
	static attempt(val){
		return Math.random() <= val;
	}
}