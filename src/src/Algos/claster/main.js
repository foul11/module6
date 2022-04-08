import { Matrix } from "../_helpers/Matrix";
import { UCanvas } from "../_helpers/UCanvas";
import { Random } from "../_helpers/Random";

export class Algo_Claster {
	// points = [];
	count_point = 0;

	constructor(input, width, height) {
		// this.matrix_input = matrix;
		// this.width = matrix.length;
		// this.height = matrix[0].length;
		// this.matrix_output = new Matrix(matrix.length, matrix[0].length, 0);
		// this._search_points();
		
		this.width = width;
		this.height = height;
		this.points = input;
		
		this.dist_name = 'Euclid';
		this.selectFunc = 'k_means';
		this.count_claster = 3;
		
		this.onstart = null;
		this.onend = null;
		this.ondraw = null;
	}
	
	*update(otherObjUCvs, numbPosArc, countPosArc, enableOutCircle = true){
		if (this.onstart instanceof Function)
			this.onstart.call(this);

		let deltaT = 0;
		let gen_algo_it = this[this.selectFunc](this.count_claster);
		let points = [];
		let clastColor = [];
		let drawObj = {};
		
		for(let i = 0; i < otherObjUCvs.length; i++){
			let item = otherObjUCvs[i];
			
			drawObj[item.id] = item;
		}

		while (true) {
			let rnext;
			
			rnext = gen_algo_it.next();

			points = rnext.value ?? points;

			for (let i = 0; i < points.length; i++) {
				let point  = points[i];
				
				if(!clastColor[point.claster])
					clastColor[point.claster] = UCanvas.hsv2rgb(Random.randF(360), Random.randF(0.75, 1), Random.randF(0.5, 1));
				
				point.color = clastColor[point.claster];
				
				if(enableOutCircle)
					drawObj[point.id + 1].color = UCanvas.invertColor(clastColor[point.claster]);
				else
					drawObj[point.id + 1].color = '#000000';
			}

			if (this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ctx);

			deltaT = yield;
		}

		if (this.onend instanceof Function)
			this.onend.call(this);
	}

	*k_means(count_claster) {//count_claster - количество кластеров
		let matrix_output = new Matrix(this.width, this.height, 0);
		let centre_claster = [];

		for (let i = 0; i < count_claster; i++) {//выбор начальных центров
			centre_claster[i] = {
				id: i,
				x: Math.floor(Math.random() * this.width),
				y: Math.floor(Math.random() * this.height),
			}
		}
		let check = true;
		let min_dist = Infinity;
		let near_claster = 0;
		while (check == true) {
			check = false;
			for (let i = 0; i < this.points.length; i++) {//раскидываем точки по класстерам
				min_dist = Infinity;
				near_claster = 0;
				for (let j = 0; j < centre_claster.length; j++) {
					if (this['_get_dist_' + this.dist_name](this.points[i], centre_claster[j]) < min_dist) {
						min_dist = this['_get_dist_' + this.dist_name](this.points[i], centre_claster[j]);
						near_claster = j;
					}
				}
				this.points[i].claster = near_claster + 1;
			}
			let min_x = Infinity;
			let max_x = 0;
			let min_y = Infinity;
			let max_y = 0;
			for (let i = 0; i < centre_claster.length; i++) {//перерасчет центра
				min_x = Infinity;
				max_x = 0;
				min_y = Infinity;
				max_y = 0;
				for (let j = 0; j < this.points.length; j++) {
					if (this.points[j].claster == i + 1) {
						if (this.points[j].x < min_x) min_x = this.points[j].x;
						if (this.points[j].x > max_x) max_x = this.points[j].x;
						if (this.points[j].y < min_y) min_y = this.points[j].y;
						if (this.points[j].y > max_y) max_y = this.points[j].y;
					}
				}
				if (centre_claster[i].x != Math.floor((min_x + max_x) / 2) || centre_claster[i].y != Math.floor((min_y + max_y) / 2)) {
					matrix_output[centre_claster[i].x][centre_claster[i].y] = 0;
					centre_claster[i].x = Math.floor((min_x + max_x) / 2);
					centre_claster[i].y = Math.floor((min_y + max_y) / 2);
					check = true;
				}
			}
			/*
			for (let i = 0; i < this.points.length; i++) {//заполняем выходную матрицу
				matrix_output[this.points[i].x][this.points[i].y] = this.points[i].claster;
			}

			for (let i = 0; i < centre_claster.length; i++) {//отмечаем/затираем центры
				if (check == true) {
					matrix_output[centre_claster[i].x][centre_claster[i].y] = -1 - i;
				} else {
					if (matrix_output[centre_claster[i].x][centre_claster[i].y] < 0) {
						matrix_output[centre_claster[i].x][centre_claster[i].y] = 0;
					}
				}
			}
			*/
			
			yield this.points;
		}
		
		// return this.points;
	}

	agglomerative(count_claster) {//необязательный
		if(count_claster==undefined){
			count_claster=3;
		}
		for(let i=0;i<this.points.length;i++){
			this.points[i].claster=Math.floor(Math.random() * (count_claster+1 - min)) + min;
		}
		return this.points;
	}

	connect_components(count_claster){
		for(let i=0;i<this.points.length;i++){
			this.points[i].claster=Math.floor(Math.random() * (count_claster+1 - min)) + min;
		}
		return this.points;
	}

	min_cover_tree(count_claster){
		for(let i=0;i<this.points.length;i++){
			this.points[i].claster=Math.floor(Math.random() * (count_claster+1 - min)) + min;
		}
		return this.points;
	}
	
	changeDistFunc(name){
		switch(name){
			case 'Euclid':
			case 'Euclid_square':
			case 'Manhattan':
			case 'Chebyshev':
				this.dist_name = name;
				break;
				
			default:
				throw Error('Dist function Error name');
		}
	}
	
	changeClastMethod(name){
		switch(name){
			case 'k_means':
			case 'agglomerative':
			case 'connect_components':
			case 'min_cover_tree':
				this.selectFunc = name;
				break;
				
			default:
				throw Error('clast generator-function Error name');
		}
	}
	
	changeClastCount(count){
		this.count_claster = count;
	}

	_search_points() {
		this.count_point = 0;
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.matrix_input[i][j] != 0) {
					this.points[this.count_point] = {
						x: i,
						y: j,
						claster: 0,
					};
					this.count_point++;
					this.matrix_output[i][j] = -1;
				}
			}
		}
	}

	_get_dist_Euclid(point1 = {}, point2 = {}) {
		return ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2);
	}
	
	_get_dist_Euclid_square(point1 = {}, point2 = {}) {
		return ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
	}
	
	_get_dist_Manhattan(point1 = {}, point2 = {}) {
		return (Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y));
	}
	
	_get_dist_Chebyshev(point1 = {}, point2 = {}) {
		return Math.max(Math.abs(point2.x - point1.x), Math.abs(point2.y - point1.y));
	}
}
