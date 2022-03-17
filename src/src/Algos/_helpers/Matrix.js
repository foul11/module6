class IMatrix{
	constructor(width, height, fill = 0){
		this.fill(width, height, fill);
	}
	
	fill(width, height, value){
		this.Matrix = [];
		
		for(let x = 0; x < width; x++){
			this.Matrix.push([])
			let Matrix = this.Matrix[x];
			
			for(let y = 0; y < height; y++){
				Matrix.push(value);
			}
		}
	}
}

export class Matrix{};

Matrix = new Proxy(IMatrix, {
	construct(target, args){
		return new Proxy(new IMatrix(...args), {
			get(target, prop, receiver){
				if(!isNaN(parseInt(prop)))
					return Reflect.get(target, 'Matrix', receiver)[prop];
				else if(prop === 'length')
					return Reflect.get(target, 'Matrix', receiver).length;
				else
					return Reflect.get(target, prop, receiver);
			},
		});
	},
});