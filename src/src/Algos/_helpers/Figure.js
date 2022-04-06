export class Figure{
	static line(x0, y0, x1, y1, wd, callback){
		let dx = Math.abs(x1-x0);
		let sx = x0 < x1 ? 1 : -1;
		let dy = Math.abs(y1-y0);
		let sy = y0 < y1 ? 1 : -1;
		let err = dx-dy
		let e2;
		let x2;
		let y2;
		let ed = dx+dy == 0 ? 1 : Math.sqrt(dx**2 + dy**2);
		
		for (wd = (wd+1)/2; ; ) {
			if(callback(x0, y0) === false)
				return;
			
			e2 = err; x2 = x0;
			
			if (2*e2 >= -dx) {
				for (e2 += dy, y2 = y0; e2 < ed*wd && (y1 != y2 || dx > dy); e2 += dx)
					if(callback(x0, y2 += sy) === false)
						return;
				
				if (x0 == x1) break;
					e2 = err; err -= dy; x0 += sx;
			}
			
			if (2*e2 <= dy) {
				for (e2 = dx-e2; e2 < ed*wd && (x1 != x2 || dx < dy); e2 += dy)
					if(callback(x2 += sx, y0) === false)
						return;
				
				if (y0 == y1) break;
					err += dx; y0 += sy;
			}
		}
	}
	
	static bsline(x0, y0, x1, y1, callback){
		if(x1 < x0)
			[ x1, x0 ] = [ x0, x1 ];
		
		if(y1 < y0)
			[ y1, y0 ] = [ y0, y1 ];
		
		let dx = x1 - x0;
		let dy = y1 - y0;
		let p = 2 * (dy) - (dx);
		
		if(callback(x0, y0) === false)
			return;
		
		if(Math.floor(x0) === Math.floor(x1) || Math.floor(y0) === Math.floor(y1))
			return;
		
		while(x0 < x1){
			if(p < 0){
				p = p + 2 * (dy);
			}else{
				y0++;
				p = p + 2 * (dy - dx);
			}
			
			x0++;
			
			if(callback(x0, y0) === false)
				return;
		}
	}
	
	static circle(cx, cy, radius, callback){
		let radius_sqr = radius ** 2;
		
		for (let  x = -radius; x < radius ; x++){
			let hh = Math.sqrt(radius_sqr - x * x);
			let rx = cx + x;
			let ph = cy+hh;
			
			for (let y = cy-hh; y < ph; y++)
				if(callback(rx, y) === false)
					return;
		}
	}
	
	static square(cx, cy, radius, callback){
		throw Error('not realised');
	}
}