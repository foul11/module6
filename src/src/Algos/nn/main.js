// #if __DEV__ && __NN_WEIGHT__
	let xhr = new XMLHttpRequest();

	xhr.onload  = function(){
		Algo_NN.Model = xhr.response;
	};

	xhr.responseType = "arraybuffer";
	xhr.open('GET', (location.protocol == 'file:' ? 'http://localhost' : '') + '/NN_50x50.php', true);
	xhr.send();
// #endif

export class Algo_NN{
	static Model = null;
	
	constructor(width, height){
		this.onstart = null;
		this.onend = null;
		
		this.ondraw = null;
		this.init(width, height);
	}
	
	init(width, height){
		this._createCanvas('', width, height, null, true);
		this._createCanvas('Perma', width, height, 'black', true);
		this._createCanvas('NN', 28, 28);
		this._createCanvas('Rescale', 0, 0);
		
		this.tyan = this._createImage(resource.img15);
		this.cloud = this._createImage(resource.img17);
		
		this.width = width;
		this.height = height;
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
		this.MaxUndo = 100;
	}
	
	_createImage(url){
		let ret = new Image();
		
		ret.src = url;
		ret.isLoad = false;
		ret.onload = () => {
			ret.isLoad = true;
		};
		
		return ret;
	}
	
	_createCanvas(pref, width, height, bg = null, lineRound = false){
		let propC = 'offscreenCanvas';
		let propB = 'offscreenBuffering';
		
		this[propC + pref] = document.createElement('canvas');
		this[propC + pref].width = width;
		this[propC + pref].height = height;
		
		this[propB + pref] = this[propC + pref].getContext('2d', { alpha: false });
		
		if(bg){
			this[propB + pref].save();
				this[propB + pref].fillStyle = bg;
				this[propB + pref].fillRect(0, 0, this[propC + pref].width, this[propC + pref].height);
			this[propB + pref].restore();
		}
		
		if(lineRound)
			this[propB + pref].lineCap = 'round';
	}
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this);
		
		let deltaT = 0;
		
		while(true){
			let ctx = this.offscreenBuffering;
			
			ctx.save();
				ctx.fillStyle = 'black';
				ctx.fillRect(0, 0, this.width, this.height);
			ctx.restore();
			
			ctx.drawImage(this.offscreenCanvasPerma, 0, 0, this.width, this.height);
			
			ctx.save();
				for(let i = 0; i < this.Undo.length; i++){
					if(i >= this.currUndoI) continue;
					
					for(let j in this.Undo[i])
						this._draw(ctx, this.Undo[i][j]);
				}
				
				for(let i in this.currUndo)
					this._draw(ctx, this.currUndo[i]);
			ctx.restore();
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ctx);
			
			deltaT = yield;
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	_draw(ctx, parm){
		switch(parm.type){
			case 'line':
				ctx.strokeStyle = parm.color;
				ctx.lineWidth = parm.size;
				
				ctx.beginPath();
				ctx.moveTo(parm.x1, parm.y1);
				ctx.lineTo(parm.x2, parm.y2);
				ctx.stroke();
				break;
				
			case 'img':
				ctx.drawImage(parm.data, parm.x1 - parm.x2, parm.y1 - parm.y2);
				break;
		}
	}
	
	startUndo(){
		this.currUndo = [];
	}
	
	endUndo(){
		if(!this.currUndo.length) return;
		
		this.Undo[this.currUndoI++] = this.currUndo;
		this.currUndo = [];
		
		if(this.Undo.length > this.MaxUndo){
			let deleted = this.Undo.splice(0, 1);
			let ctx = this.offscreenBufferingPerma;
			
			for(let i in deleted){
				ctx.save();
					for(let j in deleted[i])
						this._draw(ctx, deleted[i][j]);
				ctx.restore();
				
				this.currUndoI--;
			}
		}
	}
	
	brush(x1, y1, x2, y2, size, color){
		[x1, x2, y1, y2] = [x1, x2, y1, y2].map((curr) => Math.floor(curr));
		
		this.currUndo.push({ x1: x1, x2: x2, y1: y1, y2: y2, size: size, color: color, type: 'line' });
	}
	
	brushImage(img, x1, y1){
		let w = Math.floor(img.width / 2);
		let h = Math.floor(img.height / 2);
		
		if(this.currUndo.length)
			this.endUndo();
		
		this.currUndo.push({ x1: x1, y1: y1, x2: w, y2: h, data: img, type: 'img' });
	}
	
	erase(x1, y1, x2, y2, size){
		[x1, x2, y1, y2] = [x1, x2, y1, y2].map((curr) => Math.floor(curr));
		
		this.currUndo.push({ x1: x1, x2: x2, y1: y1, y2: y2, size: size, color: '#000', type: 'line' });
	}
	
	resize(width, height){
		this._createCanvas('', width, height, null, true);
		this._createCanvas('Perma', width, height, 'black', true);
		
		this.width = width;
		this.height = height;
	}
	
	clear(){
		this._createCanvas('Perma', this.width, this.height, 'black', true);
		
		this.Undo = [];
		this.currUndo = [];
		this.currUndoI = 0;
	}
	
	undo(){
		if(this.currUndo.length)
			this.endUndo();
		
		this.currUndoI--;
		this.currUndoI = Math.max(this.currUndoI, 0);
	}
	
	redo(){
		this.currUndoI++;
		this.currUndoI = Math.min(this.currUndoI, this.Undo.length);
	}
	
	_grayscaleToLinear(img){
		let ret = new Uint8ClampedArray(img.length / 4);
		
		for(let i = 0; i < img.length; i += 4)
			ret[i/4] = (img[i] + img[i + 1] + img[i + 2]) / 3;
		
		return ret;
	}
	
	_getAABBsLinear(img, thlds, sizeX, sizeY){
		let visited = new Uint8ClampedArray(img.length);
		let groups = [];
		
		function isNOutANVisitedPush(queue, x, y){
			let i = y * sizeX + x;
			
			if(x >= 0 && y >= 0 && x < sizeX && y < sizeY && !visited[i] && img[i] > thlds)
				queue.push(i);
		}
		
		for(let i = 0; i < img.length; i++){
			let ind = (i % sizeY) * sizeX + (Math.floor(i / sizeY));
			
			if(img[ind] > thlds && !visited[ind]){
				let queue = [ind];
				let currGroup = groups.length;
				
				groups[currGroup] = [
					sizeX,
					sizeY,
					0,
					0,
				];
				
				while(queue.length){
					let j = queue.pop();
					
					let x = j % sizeX;
					let y = Math.floor(j / sizeX);
					
					visited[j] = currGroup + 1;
					
					isNOutANVisitedPush(queue, x + 1, y);
					isNOutANVisitedPush(queue, x - 1, y);
					isNOutANVisitedPush(queue, x, y + 1);
					isNOutANVisitedPush(queue, x, y - 1);
					
					groups[currGroup][0] = Math.min(groups[currGroup][0], x);
					groups[currGroup][2] = Math.max(groups[currGroup][2], x);
					groups[currGroup][1] = Math.min(groups[currGroup][1], y);
					groups[currGroup][3] = Math.max(groups[currGroup][3], y);
				}
			}
		}
		
		if(!groups.length)
			return false;
		
		return groups;
	}
	
	_getAABBLinear(img, thlds, sizeX, sizeY){
		let [mX, mY, MX, MY] = [sizeX, sizeY, 0, 0];
		
		for(let i = 0; i < img.length; i++){
			let x = i % sizeX;
			let y = Math.floor(i / sizeX);
			
			if(img[i] > thlds){
				mX = Math.min(mX, x);
				MX = Math.max(MX, x);
				mY = Math.min(mY, y);
				MY = Math.max(MY, y);
			}
		}
		
		if(mX == sizeX || MX == 0 || mY == sizeY || MY == 0)
			return false;
		
		return [mX, mY, MX, MY];
	}
	
	_cutImg(img, sX, sY, eX, eY, sizeX, sizeY){
		let NsizeX = eX - sX;
		let NsizeY = eY - sY;
		
		let ret = new Uint8ClampedArray(NsizeX * NsizeY);
		
		for(let i = sX; i < eX; i++)
			for(let j = sY; j < eY; j++)
				ret[(i - sX) + NsizeX * (j - sY)] = img[j * sizeX + i];
		
		return ret;
	}
	
	_centringImg(img, width, height, gridWidth, gridHeight){
		let w = width + gridWidth - ((width % gridWidth) + 1);
		let h = height + gridHeight - ((height % gridHeight) + 1);
		let imgW = Math.max(w, h);
		
		let ret = new Uint8ClampedArray(imgW ** 2);
		
		let offX = Math.floor((imgW - width) / 2);
		let offY = Math.floor((imgW - height) / 2);
		
		for(let i = 0; i < width; i++)
			for(let j = 0; j < height; j++)
				ret[(i + offX) + imgW * (j + offY)] = img[j * width + i];
		
		return ret;
	}
	
	_LinearToRGBA(img){
		let ret = new Uint8ClampedArray(img.length * 4);
		
		for(let i = 0; i < img.length; i++){
			ret[i*4 + 0] = img[i];
			ret[i*4 + 1] = img[i];
			ret[i*4 + 2] = img[i];
			ret[i*4 + 3] = 255;
		}
		
		return ret;
	}
	
	_adder(img, width, height, toX, toY){
		let imgW = (width + toX * 2);
		let imgH = (height + toY * 2);
		
		let ret = new Uint8ClampedArray(imgW * imgH);
		
		for(let i = 0; i < width; i++)
			for(let j = 0; j < height; j++)
				ret[(i + toX) + imgW * (j + toY)] = img[j * width + i];
		
		return ret;
	}
	
	_boxer(img, width, height, toX, toY){
		let imgW = (width + toX * 2);
		let imgH = (height + toY * 2);
		
		let maxW = Math.max(imgW, imgH);
		
		let ret = new Uint8ClampedArray(maxW ** 2);
		
		let offX = Math.floor((maxW - width) / 2);
		let offY = Math.floor((maxW - height) / 2);
		
		for(let i = 0; i < width; i++)
			for(let j = 0; j < height; j++)
				ret[(i + offX) + maxW * (j + offY)] = img[j * width + i];
		
		return [ret, maxW, maxW];
	}
	
	_downScale(img, width, height, NSizeX, NSizeY){
		let ret = new Uint8ClampedArray(NSizeX * NSizeY);
		
		let grW = Math.ceil(width / NSizeX);
		let grH = Math.ceil(height / NSizeY);
		
		let offX = -Math.floor((width % NSizeX) / 2);
		let offY = -Math.floor((height % NSizeY) / 2);
		
		for(let i = 0; i < NSizeX; i++){
			for(let j = 0; j < NSizeY; j++){
				let light = 0;
				
				for(let iw = 0; iw < grW; iw++){
					for(let jh = 0; jh < grH; jh++){
						if(i * grW + iw < height && j * grH + jh < width && i >= 0 && j >= 0)
							light += img[(i * grW + iw + offX) * width + (j * grH + jh + offY)] ?? 0;
					}
				}
				
				ret[j * NSizeX + i] = (light / (grH * grW) * 2);
			}
		}
		
		return ret;
	}
	
	_preProcessingBeta(img){
		let gscaled = this._grayscaleToLinear(img.data);
		let AABBs = this._getAABBsLinear(gscaled, 30, img.width, img.height);
		
		let ctx = this.offscreenBufferingNN;
		let rctx = this.offscreenBufferingRescale;
		
		if(AABBs === false) return false;
		
		let proccessedDatas = [];
		
		for(let i = 0; i < AABBs.length; i++){
			let AABB = AABBs[i];
			
			let rw = AABB[2] - AABB[0];
			let rh = AABB[3] - AABB[1];
			
			let fixW = Math.max(AABB[2] - AABB[0], AABB[3] - AABB[1]);
			
			let grW = Math.ceil(fixW / ctx.canvas.width);
			let grH = Math.ceil(fixW / ctx.canvas.height);
			
			let cut = this._cutImg(gscaled, ...AABB, img.width, img.height);
			let boxed = this._boxer(cut, rw, rh, Math.floor(40 * (rw / img.width)), Math.floor(40 * (rh / img.height)));
			let downed = this._downScale(...boxed, ctx.canvas.width, ctx.canvas.height);
			
			let imgData = new ImageData(this._LinearToRGBA(downed), ctx.canvas.width, ctx.canvas.height);
			
			imgData.AABB = AABB;
			
			proccessedDatas.push(imgData);
		}
		
		return proccessedDatas;
	}
	
	_preProcessing(img){
		let gscaled = this._grayscaleToLinear(img.data);
		let AABB = this._getAABBLinear(gscaled, 30, img.width, img.height);
		
		let ctx = this.offscreenBufferingNN;
		let rctx = this.offscreenBufferingRescale;
		
		if(AABB === false) return false;
		
		let x = AABB[0] - 20;
		let y = AABB[1] - 20;
		
		let w = Math.max(AABB[2] - AABB[0], AABB[3] - AABB[1]) + 40;
		let h = w;
		
		let rw = AABB[2] - AABB[0] + 40;
		let rh = AABB[3] - AABB[1] + 40;
		
		rctx.canvas.width = w;
		rctx.canvas.height = h;
		
		let grW = Math.ceil(w / ctx.canvas.width);
		let grH = Math.ceil(h / ctx.canvas.height);
		
		let cutImg = this._centringImg(this._cutImg(gscaled, x, y, x + rw, y + rh, img.width, img.height), rw, rh, grW, grH);
		
		rctx.canvas.width = Math.max(rw + grW - ((rw % grW) + 1), rh + grH - ((rh % grH) + 1));
		rctx.canvas.height = rctx.canvas.width;
		
		let nnData = new Uint8ClampedArray(ctx.canvas.width * ctx.canvas.height);
		
		for(let i = 0; i < ctx.canvas.width; i++){
			for(let j = 0; j < ctx.canvas.height; j++){
				let light = 0;
				
				for(let iw = 0; iw < grW; iw++){
					for(let jh = 0; jh < grH; jh++){
						if((j * grH + jh) < w && i * grW + iw < h && i >= 0 && j >= 0)
							light += cutImg[(i * grW + iw) * (rctx.canvas.width) + (j * grH + jh)] ?? 0;
					}
				}
				nnData[(j) * ctx.canvas.width + i] = (light / (grH * grW) * 2);
			}
		}
		
		let ret = new ImageData(this._LinearToRGBA(nnData), ctx.canvas.width, ctx.canvas.height);
		ret.AABB = AABB;
		
		return ret;
	}
	
	NN(data){
		if(Algo_NN.Model === null)
			return '[ModelNotLoad]';
		
		let ModelLen = new Int32Array(Algo_NN.Model, 8, 6);
		let Model = new Float64Array(Algo_NN.Model, 32);
		
		let tdata = new Float64Array(data.length);
			for(let i = 0; i < data.length; i++)
				tdata[i] = data[i];
		data = tdata;
		
		for(let i = 0; i < data.length; i++)
			data[i] = (data[i] / 255 - 0.5) * 2;
		
		let offsetBias;
		let layer2 = [];
		let offsetWeight;
		
		offsetWeight = 0;
		offsetBias = offsetWeight + ModelLen[0] * ModelLen[1];
		
		for(let i = 0; i < ModelLen[0]; i++)
			layer2[i] = 0;
		
		for(let i = 0; i < ModelLen[0]; i++){
			for(let j = 0; j < ModelLen[1]; j++)
				layer2[i] += data[j] * Model[i * ModelLen[1] + j + offsetWeight];
			
			layer2[i] += Model[offsetBias + i];
			layer2[i] = 1 / (Math.exp(-layer2[i]) + 1);
		}
		
		let layer3 = [];
		
		offsetWeight = ModelLen[0] * ModelLen[1] + ModelLen[2];
		offsetBias = offsetWeight + ModelLen[3] * ModelLen[4];
		
		for(let i = 0; i < ModelLen[3]; i++){
			layer3[i] = Model[offsetBias + i];
			
			for(let j = 0; j < ModelLen[4]; j++)
				layer3[i] += layer2[j] * Model[i * ModelLen[4] + j + offsetWeight];
		}
		
		let Layer3max = layer3.reduce((prev, curr) => Math.max(prev, curr));
		let result = layer3.map((curr) => Math.exp(curr - Layer3max));
		let div = result.reduce((prev, curr) => prev + curr);
		
		return result.map((curr) => curr / div).reduce((prev, curr, i, arr) => curr > arr[prev] ? i : prev, 0);
	}
	
	static _download(blob, name){
		let link = $('<a/>');

		link.attr('href', URL.createObjectURL(new Blob([blob.buffer], {type: "octet/stream"})));
		link.attr('download', name);
		link[0].click();
		link.remove();
	}
}

window.download = Algo_NN._download;

// #if !__DEV__ && __NN_WEIGHT__
	Algo_NN.Model = require('./NN_50x50.weight');
// #endif