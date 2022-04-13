import {Matrix} from "../_helpers/Matrix";

export class Algo_Genetics {
	// points = [];
	count_point = 0;
	// matrix_output = [];
	matrix_adjacency = [];

	constructor(input /* matrix */) {
		this.points = input;
		this._set_matrix_adjacency();
		this.iterateCount = 1000;

		this.onstart = null;
		this.onend = null;
		this.ondraw = null;
		
		this.speedMul = 1;
	}

	* update(ctx) {
		if (this.onstart instanceof Function)
			this.onstart.call(this);
		
		if(!this.points.length) return;

		let deltaT = 0;
		let gen_algo_it = this.genetic();
		let points = [];

		while (true) {
			let rnext;
			
			for(let i = 0; i < this.speedMul; i++)
				points = (rnext = gen_algo_it.next()).value ?? points;

			for (let i = 0; i < points.length; i++) {
				let lastP;

				if (i === 0)
					lastP = points[points.length - 1];
				else
					lastP = points[i - 1];

				ctx.save();
					ctx.strokeStyle = '#ffa500';
					ctx.lineWidth = 5;
					ctx.beginPath();
						ctx.moveTo(lastP.x, lastP.y);
						ctx.lineTo(points[i].x, points[i].y);
					ctx.stroke();
				ctx.restore();
			}

			if (this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ctx);
			
			deltaT = yield;
		}

		if (this.onend instanceof Function)
			this.onend.call(this);
	}

	setIterateCount(val) {
		this.iterateCount = val;
	}

	setInput(input) {
		this.points = input;
		this._set_matrix_adjacency();
	}

	* genetic() {//основной алгоритм
		this.points.sort(function (a, b) {
			return a.id - b.id
		});
		let population_size = (this.points.length) ** 2;
		let index_fp = Math.floor(Math.random() * this.points.length);//индекс стартовой точки
		let population = [];
		let counter=0;
		population[0] = {
			fp: index_fp,
			route: [],
			route_length: 0,
		}
		for (let i=0;i<this.points.length;i++){
			if(i!=index_fp){
				population[0].route[counter]=i;
				counter++;
			}
		}
		this._get_route_length(population[0]);

		for (let i = 1; i < population_size; i++) {//генерируем популяцию
			population[i] = {
				fp: index_fp,//начальная точка
				route: [],
				route_length: 0,
			}
			for (let p = 0; p < this.points.length - 1; p++) {
				population[i].route[p] = -1;
			}
			for (let p = 0; p < this.points.length; p++) {
				let check = false;
				if (p != index_fp) {
					while (check != true) {
						let index = Math.floor(Math.random() * (this.points.length - 1));
						if (population[i].route[index] == -1) {
							population[i].route[index] = p;
							check = true;
						}
					}
				}
			}
			this._get_route_length(population[i]);
		}

		this._sort_population(population);
		let best_route = population[0].route_length;
		let count_repeat = 0;
		while (count_repeat < this.iterateCount) {
			this.points.sort(function (a, b) {
				return a.id - b.id
			});
			let descendants = [];
			let check = [];
			let parent1 = undefined;
			let parent2 = undefined;
			let count_use_parent = 0;
			let id_parent;
			for (let i = 0; i < population.length; i++) {
				check[i] = 0;
			}
			while (count_use_parent < population.length) {
				id_parent = Math.floor(Math.random() * population.length);

				if (parent1 == undefined) {
					if (check[id_parent] == 0) {
						parent1 = population[id_parent];
						count_use_parent++;
					}
				} else if (parent2 == undefined) {
					if (check[id_parent] == 0) {
						parent2 = population[id_parent];
						count_use_parent++;
						let flag = Math.floor(Math.random() * (Math.floor(population[0].route.length / 2) - Math.floor(population[0].route.length / 4))) + Math.floor(population[0].route.length / 4);
						this._crossover(parent1, parent2, descendants, flag);
						this._crossover(parent2, parent1, descendants, flag);
						parent1 = undefined;
						parent2 = undefined;
					}
				}
			}

			for (let i = 0; i < descendants.length; i++) {
				let probability = Math.floor(Math.random() * 100);
				if (probability < 30) {
					this._mutation(descendants[i]);
				}
				this._get_route_length(descendants[i]);
			}
			this._selection(population, descendants);
			if(population[0].route_length<best_route){
				best_route=population[0].route_length;
				count_repeat = 0;
				this.points[population[0].fp].seq_num = 1;
				for (let i = 0; i < population[0].route.length; i++) {
					this.points[population[0].route[i]].seq_num = i + 2;
				}
			}else{
				if (best_route == population[0].route_length) count_repeat++;
				else count_repeat=0;
			}
			this.points.sort(function (a, b) {
				return a.seq_num - b.seq_num
			});
			yield this.points;
		}
	}

	_crossover(parent1, parent2, descendants, flag) {//скрещивание
		let child = {
			fp: parent1.fp,
			route: [],
			route_length: 0,
		}
		let check = [];
		let count_check=0;
		for (let i = 0; i < parent1.route.length + 1; i++) {
			if (i === parent1.fp) {
				check[i] = -1;
				count_check++;
			}
			else check[i] = 0;
		}
		for (let i = 0; i < parent1.route.length; i++) {
			if(i<flag){
				child.route.push(parent1.route[i]);
				check[parent1.route[i]] = 1;
				count_check++;
			}else if(check[parent2.route[i]] === 0){
				child.route.push(parent2.route[i]);
				check[parent2.route[i]] = 1;
				count_check++
			}
		}
		for (let i = 0; i < flag; i++) {
			if(count_check>=check.length) break;
			if (check[parent2.route[i]] === 0) {
				child.route.push(parent2.route[i]);
				check[parent2.route[i]] = 1;
				count_check++;
			}
		}
		descendants.push(child);
	}

	_mutation(descendant) {//мутация
		let flag1 = Math.floor(Math.random() * (descendant.route.length-2));//Math.floor(Math.random() * (max - min)) + min
		let flag2 = Math.floor(Math.random() * (descendant.route.length - (flag1+1))) + (flag1+1);
		let temp;
		while (flag1 < flag2) {
			temp = descendant.route[flag1];
			descendant.route[flag1] = descendant.route[flag2];
			descendant.route[flag2] = temp;
			flag1++;
			flag2--;
		}
	}

	_selection(population, descendants) {//селекция
		for (let i = 0; i < descendants.length; i++) {
			population.push(descendants[i]);
		}
		this._sort_population(population);
		for(let i=0;i<descendants.length;i++){
			population.pop();
		}
		descendants = [];
	}

	_get_dist(point1 = {}, point2 = {}) {
		let res;
		res = ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2);
		return res;
	}

	_set_matrix_adjacency() {
		this.points.sort(function (a, b) {
			return a.id - b.id
		});
		this.matrix_adjacency = [];
		for (let i = 0; i < this.points.length; i++) {
			this.matrix_adjacency[i] = [];
			for (let j = 0; j < this.points.length; j++) {
				this.matrix_adjacency[i][j] = this._get_dist(this.points[i], this.points[j]);
			}
		}
	}

	_get_route_length(individual) {//расчет длины маршрута
		let res = 0;
		for (let i = 0; i < individual.route.length-1; i++) {
			res += this.matrix_adjacency[individual.route[i]][individual.route[i + 1]];
		}
		res += this.matrix_adjacency[individual.fp][individual.route[0]];
		res += this.matrix_adjacency[individual.fp][individual.route[individual.route.length-1]];
		individual.route_length = res;
	}

	_sort_population(population) {//сортировка текущей популяции по возрастанию
		population.sort(function (a, b) {
			return a.route_length - b.route_length
		});
	}
}