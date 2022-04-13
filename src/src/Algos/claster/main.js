import { Matrix } from "../_helpers/Matrix";
import { UCanvas } from "../_helpers/UCanvas";
import { Random } from "../_helpers/Random";

export class Algo_Claster {
	// points = [];
	count_point = 0;

	constructor(/*input, */width, height) {
		// this.matrix_input = matrix;
		// this.width = matrix.length;
		// this.height = matrix[0].length;
		// this.matrix_output = new Matrix(matrix.length, matrix[0].length, 0);
		// this._search_points();
		
		this.width = width;
		this.height = height;
		// this.points = input;
		
		this.dist_name = 'Euclid';
		this.selectFunc = 'k_means';
		this.count_claster = 3;
		
		this.onstart = null;
		this.onend = null;
		this.ondraw = null;
		
		this.speedMul = 1;
	}
	
	*update(input, otherObjUCvs, numbPosArc, countPosArc, enableOutCircle = true){
		if (this.onstart instanceof Function)
			this.onstart.call(this);

		let deltaT = 0;
		let gen_algo_it = this[this.selectFunc](input, this.count_claster);
		let points = [];
		let clastColor = [];
		let drawObj = {};
		
		for(let i = 0; i < otherObjUCvs.length; i++){
			let item = otherObjUCvs[i];
			
			drawObj[item.id] = item;
		}

		while (true) {
			let rnext;
			
			deltaT = yield;
			
			for(let i = 0; i < this.speedMul; i++)
				points = (rnext = gen_algo_it.next()).value ?? points;

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
		}

		if (this.onend instanceof Function)
			this.onend.call(this);
	}

	*k_means(input, count_claster) {//count_claster - количество кластеров
		let centre_claster = [];
		let points = input;

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
			for (let i = 0; i < points.length; i++) {//раскидываем точки по класстерам
				min_dist = Infinity;
				near_claster = 0;
				for (let j = 0; j < centre_claster.length; j++) {
					if (this['_get_dist_' + this.dist_name](points[i], centre_claster[j]) < min_dist) {
						min_dist = this['_get_dist_' + this.dist_name](points[i], centre_claster[j]);
						near_claster = j;
					}
				}
				points[i].claster = near_claster + 1;
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
				for (let j = 0; j < points.length; j++) {
					if (points[j].claster == i + 1) {
						if (points[j].x < min_x) min_x = points[j].x;
						if (points[j].x > max_x) max_x = points[j].x;
						if (points[j].y < min_y) min_y = points[j].y;
						if (points[j].y > max_y) max_y = points[j].y;
					}
				}
				if (centre_claster[i].x != Math.floor((min_x + max_x) / 2) || centre_claster[i].y != Math.floor((min_y + max_y) / 2)) {
					centre_claster[i].x = Math.floor((min_x + max_x) / 2);
					centre_claster[i].y = Math.floor((min_y + max_y) / 2);
					check = true;
				}
			}
			yield points;
		}
	}

	*agglomerative(input, count_claster) {//необязательный
		let points = input;
		if(count_claster==undefined){
			count_claster=3;
		}

		for(let i=0;i<points.length;i++){
			//points[i].claster=Math.floor(Math.random() * (count_claster+1));
			points[i].claster=1;
		}

		return points;
	}

	*connect_components(input, count_claster){
		let points = input;
		let matrix_adjacency=this._set_matrix_adjacency(points);
		let checkPoints = [];
		let count_comp=1;
		let count_repeat=1;
		let edges = [];
		let count_edges = 0;
		for(let i=0;i<matrix_adjacency.length;i++){
			for(let j=i;j<matrix_adjacency.length;j++){
				if(matrix_adjacency[i][j]>0){
					edges[count_edges]={
						v1: i,
						v2: j,
						len: matrix_adjacency[i][j],
					};
					count_edges++;
				}
			}
		}
		edges.sort(function (a, b) {
			return a.len - b.len
		});
		let temp;
		if(count_claster<points.length){
			while (count_comp<count_claster){
				temp=edges.pop();
				matrix_adjacency[temp.v1][temp.v2] = 0;
				matrix_adjacency[temp.v2][temp.v1] = 0;

				if(count_repeat>count_claster){
					checkPoints = this._searchComp(matrix_adjacency);
					let max_comp=checkPoints[0];
					let max_comp_i=0;
					for(let i=1;i<checkPoints.length;i++){
						if(checkPoints[i]>max_comp){
							max_comp=checkPoints[i];
							max_comp_i=i;
						}
					}
					count_comp=max_comp;
				}
				count_repeat++;
			}
		}else{
			checkPoints = this._searchComp(matrix_adjacency);

		}
		for(let i=0;i<checkPoints.length;i++){
			points[i].claster=checkPoints[i];
		}
		return points;
	}

	*min_cover_tree(input, count_claster){
		let points = input;
		let matrix_adjacency=this._set_matrix_adjacency(points);
		matrix_adjacency = this._search_tree(matrix_adjacency);
		let count_repeat=1;
		while (count_repeat<count_claster){
			let max = 0;
			let max_i = 0;
			let max_j = 0;
			for(let i=0;i<matrix_adjacency.length;i++){
				for(let j=0;j<matrix_adjacency.length;j++){
					if(matrix_adjacency[i][j]>max){
						max=matrix_adjacency[i][j];
						max_i=i;
						max_j=j;
					}
				}
			}
			matrix_adjacency[max_i][max_j] = 0;
			matrix_adjacency[max_j][max_i] = 0;
			count_repeat++;
		}
		let checkPoints = this._searchComp(matrix_adjacency);
		for(let i=0;i<checkPoints.length;i++){
			points[i].claster=checkPoints[i];
		}
		return points;
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

	// _search_points() {
		// this.count_point = 0;
		// for (let i = 0; i < this.width; i++) {
			// for (let j = 0; j < this.height; j++) {
				// if (this.matrix_input[i][j] != 0) {
					// this.points[this.count_point] = {
						// x: i,
						// y: j,
						// claster: 0,
					// };
					// this.count_point++;
					// this.matrix_output[i][j] = -1;
				// }
			// }
		// }
	// }

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

	_set_matrix_adjacency(points) {
		let matrix_adjacency = [];
		for (let i = 0; i < points.length; i++) {
			matrix_adjacency[i] = [];
			for (let j = 0; j < points.length; j++) {
				matrix_adjacency[i][j] = this['_get_dist_' + this.dist_name](points[i], points[j]);
			}
		}
		return matrix_adjacency;
	}

	_search_tree(matrix){
		let countV=matrix.length;
		let ostov = [];
		let checkV = [];
		for (let i = 0; i < countV; i++) {
			checkV[i] = 0;
			ostov[i] = [];
		}
		for (let i = 0; i < countV; i++) {
			for (let j = 0; j < countV; j++) {
				ostov[i][j] = 0;
			}
		}
		let count = 0;
		let min = 1000000;
		let min_i;
		let min_j;
		let result = 0;
		checkV[0] = 1;
		count++;

		while (count != countV) {
			min = 1000000;
			min_i = 0;
			min_j = 0;
			for (let i = 0; i < countV; i++) {
				if (checkV[i]!=0) {
					for (let j = 0; j < countV; j++) {
						if (checkV[j]==0 && matrix[i][j] > 0) {
							if (matrix[i][j] < min) {
								min = matrix[i][j];
								min_i = i;
								min_j = j;
							}
						}
					}
				}
			}
			result += min;
			ostov[min_i][min_j] = min;
			ostov[min_j][min_i] = min;
			count++;
			checkV[min_j] = 1;
		}
		return ostov;
	}

	_breadthSearch(matrix, startV, flag, checkV){
		let countV=matrix.length;
		let q = [];
		let count = 0;
		q.push(startV);
		checkV[startV] = flag;
		count++;
		let currentV;
		while (q.length>0) {
			currentV = q.shift();
			for (let j = 0; j < countV; j++) {
				if (matrix[currentV][j] > 0 && checkV[j] === 0) {
					q.push(j);
					checkV[j] = flag;
					count++;
				}
			}
		}
		return count;
	}

	_searchComp(matrix){
		let countV = matrix.length;
		let checkV = [];
		for (let i = 0; i < countV; i++) {
			checkV[i] = 0;
		}
		let countCheckV = 0;
		let countComp = 0;
		let q = [];
		for (let i = 0; i < countV; i++) {
			if (checkV[i] === 0) {
				countComp++;
				q.push(this._breadthSearch(matrix, i, countComp, checkV));
				countCheckV += q[q.length-1];
			}
			if (countCheckV == countV) break;
		}
		return checkV;
	}
}