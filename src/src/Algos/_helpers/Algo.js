export class IAlgo{
	constructor(){
		this.onstart = null;
		this.onend = null;
		
		this.ondraw = null;
	}
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		while(true){
			/* code... */
			
			let ret;
			
			ret = new Matrix(10, 10); /* from Matrix.js */
			ret = new LinearMatrix(10, { x:0, y:0 }); /* from LinearMatrix.js */
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, ret /* return val on draw */);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	
}