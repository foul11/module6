class ILinearMatrix{
	constructor(len, fill = 0){
		this.fill(len, fill);
	}
	
	fill(len, value){
		this.Matrix = [];
		
		for(let x = 0; x < len; x++){
			this.Matrix.push(value);
		}
	}
}

export class LinearMatrix{};

LinearMatrix = new Proxy(ILinearMatrix, {
	construct(target, args){
		return new Proxy(new ILinearMatrix(...args), {
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