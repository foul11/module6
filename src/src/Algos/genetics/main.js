import {Matrix} from "../_helpers/Matrix";

export class Algo_Genetics {
	// points = [];
	count_point = 0;
	// matrix_output = [];
	matrix_adjacency = [];

	constructor(input /* matrix */) {
		// this.matrix_input = matrix;
		// this.width = matrix.length;
		// this.height = matrix[0].length;
		// this.matrix_output = new Matrix(matrix.length, matrix[0].length, 0);
		this.points = input;

		// this._search_points();
		this._set_matrix_adjacency();

		this.iterateCount = 100;

		this.onstart = null;
		this.onend = null;
		this.ondraw = null;
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
			
			// for(let i = 0; i < 8; i++)
				rnext = gen_algo_it.next();

			points = rnext.value ?? points;

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

		for (let i = 0; i < population_size; i++) {//генерируем популяцию
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
						parent1 = undefined;
						parent2 = undefined;
					}
				}
			}

			for (let i = 0; i < descendants.length; i++) {
				let probability = Math.floor(Math.random() * 100);
				if (probability < 70) {
					this._mutation(descendants[i]);
				}
			}

			let best_route = population[0].route_length;
			this._selection(population, descendants);

			if (best_route == population[0].route_length) count_repeat++;
			else count_repeat = 0;

			this.points[population[0].fp].seq_num = 1;
			for (let i = 0; i < population[0].route.length; i++) {
				this.points[population[0].route[i]].seq_num = i + 2;
			}
			this.points.sort(function (a, b) {
				return a.seq_num - b.seq_num
			});
			yield this.points;
		}
	}

	_crossover(parent1, parent2, descendants, flag) {//скрещивание
		let child1 = {
			fp: parent1.fp,
			route: [],
			route_length: 0,
		}
		let check = [];
		for (let i = 0; i < parent1.route.length + 1; i++) {
			if (i == parent1.fp) check[i] = -1;
			else check[i] = 0;
		}
		for (let i = 0; i <= flag; i++) {
			child1.route.push(parent1.route[i]);
			check[parent1.route[i]] = 1;
		}
		for (let i = flag; i < parent1.route.length; i++) {
			if (check[parent2.route[i]] == 0) {
				child1.route.push(parent2.route[i]);
				check[parent2.route[i]] = 1;
			}
		}
		for (let i = 0; i < flag; i++) {
			if (check[parent2.route[i]] == 0) {
				child1.route.push(parent2.route[i]);
				check[parent2.route[i]] = 1;
			}
		}
		this._get_route_length(child1);
		descendants.push(child1);

		let child2 = {
			fp: parent1.fp,
			route: [],
			route_length: 0,
		}
		for (let i = 0; i < parent1.route.length + 1; i++) {
			if (i == parent1.fp) check[i] = -1;
			else check[i] = 0;
		}

		for (let i = 0; i < parent1.route.length + 1; i++) {
			if (i == parent1.fp) check[i] = -1;
			else check[i] = 0;
		}
		for (let i = 0; i <= flag; i++) {
			child2.route.push(parent2.route[i]);
			check[parent2.route[i]] = 1;
		}
		for (let i = flag; i < parent1.route.length; i++) {
			if (check[parent1.route[i]] == 0) {
				child2.route.push(parent1.route[i]);
				check[parent1.route[i]] = 1;
			}
		}
		for (let i = 0; i < flag; i++) {
			if (check[parent1.route[i]] == 0) {
				child2.route.push(parent1.route[i]);
				check[parent1.route[i]] = 1;
			}
		}
		this._get_route_length(child2);
		descendants.push(child2);
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
	 /*
	_mutation(descendant) {//мутиция
		let temp;
		let flag1 = Math.floor(Math.random() * descendant.length);
		let flag2 = Math.floor(Math.random() * descendant.length);
		temp = descendant[flag1];
		descendant[flag1] = descendant[flag2];
		descendant[flag2] = temp;
	}
	*/
	_selection(population, descendants) {//селекция
		for (let i = 0; i < descendants.length; i++) {
			if (descendants[i].route_length < population[population.length - 1].route_length) {
				//population[population.length - 1].fp = descendants[i].fp;
				population[population.length - 1].route_length = descendants[i].route_length;
				for (let j = 0; j < descendants[i].route.length; j++) {
					population[population.length - 1].route[j] = descendants[i].route[j];
				}
				this._sort_population(population)
			}
		}
		descendants = undefined;
		descendants = [];
	}

	_search_points() {
		this.count_point = 0;
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.matrix_input[i][j] != 0) {
					this.points[this.count_point] = {
						x: i,
						y: j,
						seq_num: 0,//порядковый номер в маршруте
					};
					this.count_point++;
					this.matrix_output[i][j] = -1;
				}
			}
		}
	}

	_get_dist(point1 = {}, point2 = {}) {
		let res;
		//res = Math.floor(((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2));
		res = ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2);
		return res;
	}

	_set_matrix_adjacency() {
		this.matrix_adjacency = []; //new Matrix(this.points.length, this.points.length, 0);
		for (let i = 0; i < this.points.length; i++) {
			this.matrix_adjacency[i] = [];
			
			for (let j = 0; j < this.points.length; j++) {
				this.matrix_adjacency[i][j] = this._get_dist(this.points[i], this.points[j]);
			}
		}
	}

	_get_route_length(individual) {//расчет длины маршрута
		let res = 0;
		for (let i = 0; i < this.matrix_adjacency.length - 2; i++) {
			res += this.matrix_adjacency[individual.route[i]][individual.route[i + 1]];
		}
		res += this.matrix_adjacency[individual.fp][individual.route[0]];
		res += this.matrix_adjacency[individual.fp][individual.route[this.matrix_adjacency.length - 2]];
		individual.route_length = res;
	}

	_sort_population(population) {//сортировка текущей популяции по возрастанию
		population.sort(function (a, b) {
			return a.route_length - b.route_length
		});
	}
}