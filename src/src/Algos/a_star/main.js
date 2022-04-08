import { Matrix } from "../_helpers/Matrix";

class Point{
	constructor(x, y){
		this.w = x;
		this.h = y;
	}
}

export class Algo_a_star{
	constructor(Matrix, height, width){
		this.onstart = null;
		this.onend = null;
		
		this.walls = Matrix;
		this.height = Number(height);
		this.width = Number(width);
		this.ondraw = null;

		this.queue = [];
	}
	
	resize(Matrix, height, width){
		this.walls = Matrix;
		this.height = Number(height);
		this.width = Number(width);
	}

	_print_matrix(matrix = this.walls){
		for (let h = 0; h < this.height; h++){
			let s = ''
			
			for (let w = 0; w < this.width; w++)
				s += matrix[w][h] + ' ';
			
			console.log(s);
		}
	};
	
	*update(){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		while(true){
			/* code... */
			let deltaT = yield;
			let ret = this.test;
			
			if(this.queue.length == 0)
				continue;
			
			let step = this.queue.splice(0, 1)[0];
			
			switch (step.func) {
				/*case 'labirint':
					console.log(step);
					
					let generator = this._labirint();
					let flag = false;
					let result;

					while(!flag){
						let func_vals = generator.next();
						result = func_vals.value;
						flag = func_vals.done;
						console.log(result);
					}
					break;*/
			
				default:
					break;
			}
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, ret);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}

	a_star(start_x, start_y, end_x, end_y){
		let height = this.height;
		let width = this.width;
		let start = new Point(start_x, start_y);
		let end = new Point(end_x, end_y);

		class Node{
			constructor(parent = undefined, position = undefined){
				this.parent = parent;
				this.position = position;

				this.g = 0;  //стоимость пути от начальной вершины до любой другой
				this.h = 0;  //эвристическое приближение стоимости пути от узла n до конечного узла
				this.f = 0;  //минимальная стоимость перехода в соседний узел
			}
		}

		function return_path(current_node, maze){
			let path = [];
			let current = current_node;
			let result = new Matrix(width, height);

			for (let i = 0; i < height; i++){
				for (let j = 0; j < width; j++){
					result[j][i] = -1;
				}
			}

			while (current !== undefined){
				path.push(current.position);
				current = current.parent;
			}
			
			path = path.reverse();
			let start_val = 0;

			for (let i = 0; i < path.length; i++){
				console.log(start_val, path[i].w, path[i].h);
				result[path[i].w][path[i].h] = start_val;
				start_val++;
			}

			return result;
		}

		function search(maze, cost, start, end){
			let start_node = new Node(undefined, start);
			let end_node = new Node(undefined, end);

			start_node.g = 0;
			start_node.h = 0;
			start_node.f = 0;
			
			end_node.g = 0;
			end_node.h = 0;
			end_node.f = 0;

			let yet_to_visit_list = [];
			let visited_list = [];

			yet_to_visit_list.push(start_node);

			let outer_iterations = 0; //step
			let max_iterations = parseInt(Math.pow(width / 2, 10));

			let move = [new Point(-1, 0), new Point(0, -1), new Point(1, 0), new Point(0, 1)];

			while (yet_to_visit_list.length > 0){
				outer_iterations++;

				let current_node = yet_to_visit_list[0];
				let current_index = 0;

				for (let index = 0; index < yet_to_visit_list.length; index++){
					let item = yet_to_visit_list[index];
					
					if (item.f < current_node.f){
						current_node = item;
						current_index = index;
					}
				}

				if (outer_iterations > max_iterations){
					return return_path(current_node, maze);
				}

				yet_to_visit_list.splice(current_index, 1);
				visited_list.push(current_node);

				if (current_node.position.w == end_node.position.w && current_node.position.h == end_node.position.h){
					console.log(1); /* Что это тут делает? */
					return return_path(current_node, maze);
				}

				let children = [];

				for (let new_position of move){
					let x = current_node.position.w + new_position.w;
					let y = current_node.position.h + new_position.h;
					let node_position = new Point(x, y);
					let node_x = node_position.w;
					let node_y = node_position.h;
					
					if (node_x > (width - 1) || node_x < 0 || node_y > (height - 1) || node_y < 0)
						continue;

					if (maze[node_x][node_y] !== 0)
						continue;

					let new_node = new Node(current_node, node_position);

					children.push(new_node);
				}

				for (let child of children){
					let child_visited = [];

					for (let visited_child of visited_list)
						if (visited_child === child)
							child_visited.push(visited_child);

					if (child_visited.length > 0)
						continue;

					child.g = current_node.g + cost;
					
					let child_x = Math.pow(child.position.w - end_node.position.w, 2);
					let child_y = Math.pow(child.position.h - end_node.position.h, 2);

					child.h = child_x + child_y;
					child.f = child.g + child.h;

					let arr = [];

					for (let i of yet_to_visit_list)
						if (child === i && child.g > i.g)
							arr.push(i);

					if (arr.length > 0)
						continue;

					yet_to_visit_list.push(child);
				}
			}
		}

		let cost = 1;
		let answer = search(this.walls, cost, start, end);

		this._print_matrix(answer);		

		this.queue.push({func: 'a_star', var: arguments});
	}
	
	labirint_prima(){
		for (let i = 0; i < this.height; i++)
			for (let j = 0; j < this.width; j++)
				this.walls[j][i] = true;

		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			
			return Math.floor(Math.random() * (max - min)) + min;
		}

		let x = getRandomInt(0, this.width/2) * 2 + 1;
		let y = getRandomInt(0, this.height/2) * 2 + 1;
		
		this.walls[x][y] = false;
		
		let to_check = [];

		if (y-2 >= 0)
			to_check.push(new Point(x, y - 2));
		
		if (y + 2 < this.height)
			to_check.push(new Point(x, y + 2));
		
		if (x-2 >= 0)
			to_check.push(new Point(x - 2, y));
		
		if (x+2 < this.width)
			to_check.push(new Point(x + 2, y));

		while (to_check.length > 0){
			let index = getRandomInt(0, to_check.length)
			let cell = to_check[index];

			let x = cell.w;
			let y = cell.h;

			this.walls[x][y] = false;
			to_check.splice(index, 1);

			let Direction = ['North', 'South', 'West', 'East'];

			while (Direction.length > 0){
				let dir_index = getRandomInt(0, Direction.length);
				
				switch (Direction[dir_index]){
					case 'North':
						if (y - 2 >= 0 && !this.walls[x][y-2]){
							this.walls[x][y-1] = false;
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 'South':
						if (y + 2 < this.height && !this.walls[x][y + 2]){
							this.walls[x][y + 1] = false;
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 'West':
						if (x + 2 < this.width && !this.walls[x+2][y]){
							this.walls[x + 1][y] = false;
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 'East':
						if (x - 2 >= 0 && !this.walls[x-2][y]){
							this.walls[x - 1][y] = false;
							Direction.splice(0, Direction.length);
						}
						break;
				};

				Direction.splice(dir_index, 1);
			}

			if (y - 2 >= 0 && this.walls[x][y-2])
				to_check.push(new Point(x, y - 2));
			
			if (y + 2 < this.height && this.walls[x][y+2])
				to_check.push(new Point(x, y + 2));
			
			if (x - 2 >= 0 && this.walls[x-2][y])
				to_check.push(new Point(x - 2, y));
			
			if (x + 2 < this.width && this.walls[x+2][y])
				to_check.push(new Point(x + 2, y));
			
		}

		for (let i = 0; i < 4; i++){
			let dead_ends = [];

			for (let h = 0; h < this.height; h++){
				for (let w = 0; w < this.width; w++){
					if (!this.walls[w][h]){
						let neighbors = 0;
						if (h - 1 >= 0 && !this.walls[w][h-1])
							neighbors++;
							
						if (h + 1 < this.height && !this.walls[w][h+1])
							neighbors++;
						
						if (w - 1 >= 0 && !this.walls[w-1][h])
							neighbors++;
						
						if (w + 1 < this.width && !this.walls[w+1][h])
							neighbors++;
						
						
						if (neighbors <= 1)
							dead_ends.push(new Point(w, h));
						
					}
				}
			}

			for (let cell of dead_ends)
				this.walls[cell.w][cell.h] = true;
		}
		
		if (this.width % 2 === 0){
			for (let cell = 0; cell < this.width; cell++){
				this.walls[this.width - 1][cell] = true;
				this.walls[cell][this.height - 1] = true;
			}
		}

		for (let h = 0; h < this.height; h++){
			for (let w = 0; w < this.width; w++){
				if (this.walls[w][h])
					this.walls[w][h] = 1;
					
				if (!this.walls[w][h])
					this.walls[w][h] = 0;
			}
		}
		
		this._print_matrix(this.walls);
		
		return this.walls;
		
		this.queue.push({func: 'labirint_prima', var: arguments});
	}

	/**_labirint(){
		let i = 0;

		while(true){
			console.log('Ok');
			yield i++;

			if (i > 5)
				break;
		}
	}*/
}