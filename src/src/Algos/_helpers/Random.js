export class Random{
	static randF(min = Number.MAX_VALUE, max = Number.MAX_VALUE){
		if(min === max && min === Number.MAX_VALUE) min = 0;
		
		return Math.random() * (max - min) + min;
	}
	
	static randI(min = Number.MAX_VALUE, max = Number.MAX_VALUE){
		return Math.floor(Random.randF(min, max));
	}
}