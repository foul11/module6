export class Algo_a_star{
	constructor(){
		this.onstart = null;
		this.onend = null;
		
		this.ondraw = null;
		this.test = {x: 5, y: 3, color: '#ff0000'};
	}
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		while(true){
			/* code... */
			let deltaT = yield;
			let ret = this.test;
			
			//ret = new Matrix(10, 10); /* from Matrix.js */
			//ret = new LinearMatrix(10, { x:0, y:0 }); /* from LinearMatrix.js */
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ret);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	labirint() {
		this.test = {x: 5, y: 3, color: '#00ff00'};
	}
}