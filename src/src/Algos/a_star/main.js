import { Matrix } from "../_helpers/Matrix";
import { UCanvas } from "../_helpers/UCanvas";

class Point{
	constructor(x, y){
		this.w = x;
		this.h = y;
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

export class Algo_a_star{
	static QTYPE = {
		LABIRINT: 1,
		A_STAR: 2,
	};
	
	constructor(/* Matrix, height, width */){
		this.onstart = null;
		this.onend = null;
		
		// this.walls = Matrix;
		// this.height = Number(height);
		// this.width = Number(width);
		this.ondraw = null;

		this.queue = [];
	}
	
	resize(/* Matrix, */height, width){
		// this.walls = Matrix;
		// this.height = Number(height);
		// this.width = Number(width);
	}

	_print_matrix(matrix = this.walls){
		for (let h = 0; h < this.height; h++){
			let s = ''
			
			for (let w = 0; w < this.width; w++)
				s += matrix[w][h] + ' ';
			
			console.log(s);
		}
	};
	
	*update(UCvs, UCvsUpdater){
		if(this.onstart instanceof Function)
			this.onstart.call(this)();
		
		let grid = [];
		
		UCvs.onbrush = function(obj, x, y){
			if(obj === UCanvas.RECT.DELETE)
				grid[x][y] = true;
			else
				grid[x][y] = false;
		};
		
		UCvs.ongridchange = function(gridG, gridO, gridC){
			grid = [];
			
			for(let i = 0; i < gridC.x; i++){
				grid[i] = [];
				
				for(let j = 0; j < gridC.y; j++){
					grid[i][j] = true;
				}
			}
		};
		
		UCvs.ongridchange(null, null, UCvs.getGridCount());
		
		while(true){
			let deltaT = yield;
			
			UCvsUpdater(deltaT);
			
			if (this.queue.length == 0)
				continue;
			
			let curr = this.queue.splice(0, 1)[0];
			
			let next;
			
			switch (curr.type) {
				case Algo_a_star.QTYPE.LABIRINT:
					while(!(next = curr.gen.next()).done){
						deltaT = yield;
						
						let x = next.value.y + 1;
						let y = next.value.x + 1;
						let wall = next.value.wall;
						let currGrid = UCvs.grid;
						
						grid[x][y] = wall;
						
						UCvs.save();
							UCvs.setBrushSize(UCvs.grid.x);
							
							if(wall){
								UCvs.setBrushSelect('Erase');
								UCvs.brush(x * currGrid.x, y * currGrid.y);
							}else{
								UCvs.setBrushSelect('FillBox');
								UCvs.setBrushColor('#555555');
								UCvs.brush(x * currGrid.x, y * currGrid.y);
							}
						UCvs.restore();
						
						UCvsUpdater(deltaT);
					}
					
					// let currGrid = UCvs.grid;
					
					// for(let i = 1; i <= next.value.length; i++){
						// for(let j = 1; j <= next.value[0].length; j++){
							// if(next.value[i-1][j-1]){
								// UCvs.setBrushSelect('Erase');
								// UCvs.brush(i * currGrid.x , j * currGrid.y);
							// }else{
								// UCvs.setBrushSelect('FillBox');
								// UCvs.setBrushColor('#555555');
								// UCvs.brush(i * currGrid.x, j * currGrid.y);
							// }
						// }
					// }
					
					// next.value
					console.log(next.value);
					break;
			
				default:
					throw Error('QTYPE Error');
					break;
			}
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, /* ret */);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	labirint(name, width, height){
		let lab;
		
		switch(name){
			case 'prima': lab = this._labirint_Prima(width, height); break;
			case 'kruskal': lab = this._labirint_Kruskal(width, height); break;
			default: throw Error('labirint name Error');
		}
		
		this.queue.push({ type: Algo_a_star.QTYPE.LABIRINT, gen: lab });
	}

	*_a_star(maze, start_x, start_y, end_x, end_y){
		// let height = this.height;
		// let width = this.width;
		let height = maze[0].length;
		let width = maze.length;
		
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

		function *return_path(current_node){
			let path = [];
			let current = current_node;
			// let result = new Matrix(width, height);

			// for (let i = 0; i < height; i++)
				// for (let j = 0; j < width; j++)
					// result[j][i] = -1;

			while (current !== undefined){
				path.push(current.position);
				current = current.parent;
			}

			if (path[0].w !== end.w && path[0].h !== end.h)
				return false;
			
			path = path.reverse();
			let start_val = 0;

			for (let i = 0; i < path.length; i++){
				// result[path[i].w][path[i].h] = start_val;
				yield { x: path[i].w, y: path[i].h, val: start_val };
				start_val++;
			}

			return path;
		}

		function *search(maze, cost, start, end){
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
				
				yield { x: current_node.position.w, y: current_node.position.h, child: false };

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

					if (maze[node_x][node_y] != 0)
						continue;

					let new_node = new Node(current_node, node_position);

					children.push(new_node);
				}

				for (let child of children){
					let child_visited = [];

					for (let visited_child of visited_list)
						if (visited_child === child) /* Не достижимое место, попытка сравнивать новую ноду, с уже посещеными, всегда будет false вне зависмости от значений в обьекте */
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
					
					yield { x: child.position.w, y: child.position.h, child: true };
				}
			}
		}

		let cost = 1;
		return yield* search(this.walls, cost, start, end);
	}
	
	*_labirint_Prima(width, height) {
        let maze = [];
		for (let i = 0; i < height; i++){
			maze[i] = [];
			
			for (let j = 0; j < width; j++){
				maze[i][j] = true;
                // yield {x:j, y:i};
            }
		}
		
		let x = getRandomInt(0, width/2) * 2 + 1;
		let y = getRandomInt(0, height/2) * 2 + 1;
		
		maze[x][y] = false;
        yield { x: x, y: y, wall: false };
		
		let to_check = [];

		if (y-2 >= 0)
			to_check.push(new Point(x, y - 2));
		
		if (y + 2 < height)
			to_check.push(new Point(x, y + 2));
		
		if (x-2 >= 0)
			to_check.push(new Point(x - 2, y));
		
		if (x+2 < width)
			to_check.push(new Point(x + 2, y));

		while (to_check.length > 0){
			let index = getRandomInt(0, to_check.length)
			let cell = to_check[index];

			let x = cell.w;
			let y = cell.h;

			maze[x][y] = false;
			yield { x: x, y: y, wall: false };
			
			to_check.splice(index, 1);

			let Direction = [1, 2, 3, 4];

			while (Direction.length > 0){
				let dir_index = getRandomInt(0, Direction.length);
				
				switch (Direction[dir_index]){
					case 1: //North
						if (y - 2 >= 0 && !maze[x][y-2]){
							maze[x][y-1] = false;
                            yield { x: x, y: y - 1, wall: false };
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 2: //South
						if (y + 2 < height && !maze[x][y + 2]){
							maze[x][y + 1] = false;
                            yield { x: x, y: y + 1, wall: false };
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 3: //West
						if (x + 2 < width && !maze[x+2][y]){
							maze[x + 1][y] = false;
                            yield { x: x + 1, y: y, wall: false };
							Direction.splice(0, Direction.length);
						}
						break;
						
					case 4:	//East
						if (x - 2 >= 0 && !maze[x-2][y]){
							maze[x - 1][y] = false;
                            yield { x: x - 1, y: y, wall: false };
							Direction.splice(0, Direction.length);
						}
						break;
				};
				
				Direction.splice(dir_index, 1);
			}

			if (y - 2 >= 0 && maze[x][y-2])
				to_check.push(new Point(x, y - 2));
			
			if (y + 2 < height && maze[x][y+2])
				to_check.push(new Point(x, y + 2));
			
			if (x - 2 >= 0 && maze[x-2][y])
				to_check.push(new Point(x - 2, y));
			
			if (x + 2 < width && maze[x+2][y])
				to_check.push(new Point(x + 2, y));
			
		}

		for (let i = 0; i < 4; i++){
			let dead_ends = [];

			for (let h = 0; h < height; h++){
				for (let w = 0; w < width; w++){
					if (!maze[w][h]){
						let neighbors = 0;
						if (h - 1 >= 0 && !maze[w][h-1])
							neighbors++;
							
						if (h + 1 < height && !maze[w][h+1])
							neighbors++;
						
						if (w - 1 >= 0 && !maze[w-1][h])
							neighbors++;
						
						if (w + 1 < width && !maze[w+1][h])
							neighbors++;
						
						
						if (neighbors <= 1)
							dead_ends.push(new Point(w, h));
						
					}
				}
			}

			for (let cell of dead_ends){
				maze[cell.w][cell.h] = true;
                yield { x: cell.w, y: cell.h, wall: true };
			}
		}
		
		if (width % 2 === 0){
			for (let cell = 0; cell < width; cell++){
				maze[width - 1][cell] = true;
                yield { x: width - 1, y: cell, wall: true };
				maze[cell][height - 1] = true;
                yield { x: cell, y: height - 1, wall: true };
			}
		}

		// for (let h = 0; h < height; h++){
			// for (let w = 0; w < width; w++){
				// if (maze[w][h])
					// maze[w][h] = 1;
					
				// if (!maze[w][h])
					// maze[w][h] = 0;
			// }
		// }
		
		return maze;
	}

	_labirint_Kruskal(){ //хуета
		for (let i = 0; i < this.height; i++){
			for (let j = 0; j < this.width; j++){
				this.walls[j][i] = 1;
			}
		}

		let edges = [];

		for (let i = 1; i < this.height - 3; i++){
			for (let j = 1; j < this.width - 3; j++){
				edges.push([new Point(j, i), new Point(j + 1, i), new Point(j + 2, i)]);
				edges.push([new Point(j, i), new Point(j, i + 1), new Point(j, i + 2)]);
			}
		}
		console.log(edges);
		function delete_walls(matrix, edge){
			matrix[edge[0].w][edge[0].h] = 0;
			matrix[edge[1].w][edge[1].h] = 0;
			matrix[edge[2].w][edge[2].h] = 0;
		}

		function check(previous, current){
			for (let i = 0; i < 3; i++){
				for (let j = 0; j < 3; j++){
					if (i !== 1 && j !== 1 && previous[i].h === current[j].h && previous[i].w === current[j].w){
						return false;
					}
				}
			}
			return true;
		}

		let index = getRandomInt(0, edges.length);
		delete_walls(this.walls, edges[index]);
		let previous = edges[index];
		edges.splice(index, 1);
		
		let count = 0;
		let max = edges.length;

		while (true){
			this.print_matrix(this.walls);
			let index = getRandomInt(0, edges.length);
			console.log(index);
			let current = edges[index];

			if (check(previous, current)){
				delete_walls(this.walls,edges[index]);
				previous = edges[index];
				edges.splice(index, 1);
			}

			count++;
			if (count === max){
				break;
			}
		}

		this.print_matrix(this.walls);
	}

	_labirint_Xueta(){ //не работает
		let unvisited = [];
		for (let i = 0; i < this.height; i++){
			for (let j = 0; j < this.width; j++){
				if (i % 2 !== 0 && j % 2 !== 0 && i < this.height - 1 && j < this.width - 1){
					this.walls[j][i] = false;
					unvisited.push(new Point(j, i));
				}
				else{
					this.walls[j][i] = true;
				}
			}

			let start = new Point(1, 1);
			let current_cell = start;
			let neighbour_cell;
			let stack = []; 

			function getNeighbours(width, height, cell){
				let x = cell.w;
				let y = cell.h;

				let up = new Point(x, y - 2);
				let rt = new Point(x + 2, y);
				let dw = new Point(x, y + 2);
				let lt = new Point(x - 2, y);
				let d = [dw, rt, up, lt];

				let cells = [];

				for (let i = 0; i < 4; i++){
					if (d[i].w > 0 && d[i].w < width && d[i].h > 0 && d[i].h < height){
						let flag = false;
						for (let j of unvisited){
							if (d[i].w === j.w || d[i].h === j.h){
								flag = true;
								break;
							}
						}

						if (!flag){
							cells.push(d[i]);
						}
					}
				}

				return cells;
			}

			while (unvisited.length > 0){
				let neighbours = getNeighbours(this.width, this.height, current_cell, 2);
				
				if (neighbours.length != 0){
					let rand_num = getRandomInt(0, neighbours.length - 1);
					neighbour_cell = neighbours[rand_num];
					
					stack.push(current_cell);

					let xDiff = neighbour_cell.w - current_cell.w;
					let yDiff = neighbour_cell.h - current_cell.h;
					
					if (xDiff === 0){
						if (yDiff < 0){
							this.walls[neighbour_cell.w][current_cell.h - (Math.abs(yDiff) - 1)] = true;

						}
						else{
							this.walls[neighbour_cell.w][yDiff - 1 + current_cell.h] = true;
					
						}	
					}
					if (yDiff === 0){
						if (xDiff < 0){
							this.walls[current_cell.w - (Math.abs(xDiff) - 1)][current_cell.h] = true;

						}
						else{
							this.walls[xDiff - 1 + current_cell.w ][current_cell.h] = true;
					
						}	
					}

					current_cell = neighbour_cell;

					for (let i of unvisited){
						if (current_cell.w === i.w && current_cell.h === i.h){
							unvisited.splice(i, 1);
							break;
						}
					}
				}

				else if (stack.length > 0){
					start = stack.pop();
				}

				else{
					let index = getRandomInt(0, unvisited.length);
					let current_cell = unvisited[index];
					unvisited.splice(index, 1);
				}
			}
		}

		this.print_matrix(this.walls);
	}
}