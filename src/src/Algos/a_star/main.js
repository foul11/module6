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
		this.forceStop = false;
		
		this.StartPoint = null;
		this.EndPoint = null;
		this.StartPointO = null;
		this.EndPointO = null;
		
		this.speedMul = 1;
		
		this.grid = [];

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
		
		let deltaT;
		this.grid = [];
		
		UCvs.onbrush = function(obj, x, y){
			if(obj.deco) return;
			if(obj.type === UCanvas.RECT.DELETE)
				this.grid[x][y] = true;
			else if(obj.type === UCanvas.RECT.FBOX)
				this.grid[x][y] = false;
		}.bind(this);
		
		UCvs.ongridchange = function(gridG, gridO, gridC){
			this.grid = [];
			
			for(let i = 0; i < gridC.x; i++){
				this.grid[i] = [];
				
				for(let j = 0; j < gridC.y; j++){
					this.grid[i][j] = true;
				}
			}
		}.bind(this);
		
		UCvs.onclear = function(){
			UCvs.ongridchange(null, null, UCvs.getGridCount());
		}.bind(this);
		
		UCvs.onclear();
		
		let i = 0;
		
		while(true){
			if(!(++i % this.speedMul)){
				deltaT = yield;
				UCvsUpdater(deltaT);
			}
			
			if (this.queue.length == 0)
				continue;
			
			this.forceStop = false;
			
			let curr = this.queue.splice(0, 1)[0];
			let next;
			
			switch (curr.type) {
				case Algo_a_star.QTYPE.LABIRINT:
					while(!(next = curr.gen.next()).done){
						if(!(++i % this.speedMul))
							deltaT = yield;
						
						if(this.forceStop)
							break;
						
						let x = next.value.x + 1;
						let y = next.value.y + 1;
						let currGrid = UCvs.grid;
						
						UCvs.save();
							UCvs.setBrushSize(UCvs.grid.x);
							
							if(next.value.wall){
								UCvs.setBrushSelect('Erase');
								UCvs.brush(x * currGrid.x, y * currGrid.y);
							}else{
								UCvs.setBrushSelect('FillBox');
								UCvs.setBrushColor('#555555');
								UCvs.brush(x * currGrid.x, y * currGrid.y, null, null, UCanvas.CHECK.NONE);
							}
						UCvs.restore();
						
						if(!(i % this.speedMul))
							UCvsUpdater(deltaT);
					}
					break;
					
				case Algo_a_star.QTYPE.A_STAR:
					let EndPV = this.grid[curr.args[2]][curr.args[3]];
					this.grid[curr.args[2]][curr.args[3]] = false;
					
					while(!(next = curr.gen.next()).done){
						if(!(++i % this.speedMul)) 
							deltaT = yield;
						
						if(this.forceStop)
							break;
						
						let x = next.value.x + 1;
						let y = next.value.y + 1;
						let currGrid = UCvs.grid;
						
						UCvs.save();
							UCvs.setBrushSize(UCvs.grid.x / 4);
							UCvs.setBrushSelect('FillBox');
							UCvs.setBrushColor('#00FF00');
							
							UCvs.brush(x * currGrid.x, y * currGrid.y, null, null, UCanvas.CHECK.NONE, { deco: true });
						UCvs.restore();
						
						if(!(i % this.speedMul))
							UCvsUpdater(deltaT);
					}
					
					this.grid[curr.args[2]][curr.args[3]] = EndPV;
					
					if(this.forceStop)
						break;
					
					curr.gen = next.value;
					
					if(curr.gen === false){
						UCvs.save();
							UCvs.setBrushSelect('FSText');
							UCvs.setBrushColor('#FF0000');
							UCvs.setBrushFont('10em monospace');
							UCvs.setBrushAlign(UCanvas.ALIGN.MIDDLE | UCanvas.ALIGN.CENTER);
							UCvs.setBrushText('ПУТЬ НЕ НАЙДЕН!');
							UCvs.brush(UCvs.width / 2, UCvs.height / 2);
						UCvs.restore();
						
						break;
					}
					
					let LastP = null;
					
					while(!(next = curr.gen.next()).done){
						if(!(++i % this.speedMul)) 
							deltaT = yield;
						
						if(this.forceStop)
							break;
						
						let x = next.value.x + 1;
						let y = next.value.y + 1;
						let currGrid = UCvs.grid;
						
						if(LastP){
							UCvs.save();
								UCvs.setBrushSize(UCvs.grid.x / 4);
								UCvs.setBrushSelect('Line');
								UCvs.setBrushColor('#FF0000');
								
								UCvs.brush(LastP.x * currGrid.x, LastP.y * currGrid.y, x * currGrid.x, y * currGrid.y, UCanvas.CHECK.NONE, { deco: true });
							UCvs.restore();
						}
						
						LastP = { x: x, y: y };
						
						if(!(i % this.speedMul))
							UCvsUpdater(deltaT);
					}
					break;
			
				default:
					throw Error('QTYPE Error');
					break;
			}
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, null);
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
		
		this.queue.push({ type: Algo_a_star.QTYPE.LABIRINT, gen: lab, args: arguments });
	}
	
	a_star(x1, y1, x2, y2){
		this.queue.push({ type: Algo_a_star.QTYPE.A_STAR, gen: this._a_star({ x: x1, y: y1}, { x: x2, y: y2}), args: arguments });
	}

	*_a_star(start, end){
		let maze = this.grid;
		
		let height = maze[0].length;
		let width = maze.length;

		class Node{
			constructor(parent, pos){
				this.parent = parent;
				this.pos = pos;

				this.g = 0;  //стоимость пути от начальной вершины до любой другой
				this.h = 0;  //эвристическое приближение стоимости пути от узла n до конечного узла
				this.f = 0;  //минимальная стоимость перехода в соседний узел
			}
		}

		function *return_path(current_node){
			let path = [];
			
			do{
				path.push(current_node.pos);
			}while(current_node = current_node.parent);
			
			if (path[0].x !== end.x &&
				path[0].y !== end.y)
				return false;
			
			for (let i = path.length; i--;)
				yield { x: path[i].x, y: path[i].y };
				
			return path;
		}

		function *search(maze, cost, start, end){
			let start_node = new Node(null, start);
			let end_node = new Node(null, end);

			let yet_to_visit_list = [];
			let visited_list = [];

			yet_to_visit_list.push(start_node);

			let move = [[-1, 0], [0, -1], [1, 0], [0, 1]];

			while (yet_to_visit_list.length){
				let curr_node = yet_to_visit_list[0];
				let curr_index = 0;
				
				yield { x: curr_node.pos.x, y: curr_node.pos.y, child: false };

				for (let i = 0; i < yet_to_visit_list.length; i++){
					let item = yet_to_visit_list[i];
					
					if (item.f < curr_node.f){
						curr_node = item;
						curr_index = i;
					}
				}

				yet_to_visit_list.splice(curr_index, 1);
				visited_list.push(curr_node);

				if (curr_node.pos.x == end_node.pos.x &&
					curr_node.pos.y == end_node.pos.y){
					return return_path(curr_node);
				}

				let childrens = [];

				for (let to_pos of move){
					let x = curr_node.pos.x + to_pos[0];
					let y = curr_node.pos.y + to_pos[1];
					
					if (x > (width - 1) || x < 0 || y > (height - 1) || y < 0)
						continue;

					if (maze[x][y] === true)
						continue;
					
					childrens.push(new Node(curr_node, { x: x, y: y }));
				}

				for (let child of childrens){
					let child_visited = [];

					for (let visited_child of visited_list)
						if (visited_child.pos.x === child.pos.x &&
							visited_child.pos.y === child.pos.y)
							child_visited.push(visited_child);

					if (child_visited.length)
						continue;

					child.g = curr_node.g + cost;
					
					let child_x = (child.pos.x - end_node.pos.x) ** 2;
					let child_y = (child.pos.y - end_node.pos.y) ** 2;

					child.h = child_x + child_y;
					child.f = child.g + child.h;

					let arr = [];

					for (let i of yet_to_visit_list)
						if (child === i && child.g > i.g)
							arr.push(i);

					if (arr.length)
						continue;

					yet_to_visit_list.push(child);
					
					yield { x: child.pos.x, y: child.pos.y, child: true };
				}
			}
			
			return false;
		}

		let cost = 1;
		return yield* search(maze, cost, start, end);
	}
	
	*_labirint_Prima(width, height, cut_edge = 0) {
        let maze = [];
		for (let i = 0; i < width; i++){
			maze[i] = [];
			
			for (let j = 0; j < height; j++)
				maze[i][j] = true;
		}
		
		let x = getRandomInt(0, width/2) * 2 + 1;
		let y = getRandomInt(0, height/2) * 2 + 1;
		
		maze[x][y] = false;
        yield { x: x, y: y, wall: false };
		
		let to_check = [];

		if (y-2 >= 0)
			to_check.push({ x: x, y: y - 2 });
		
		if (y+2 < height)
			to_check.push({ x: x, y: y + 2 });
		
		if (x-2 >= 0)
			to_check.push({ x: x - 2, y: y });
		
		if (x+2 < width)
			to_check.push({ x: x + 2, y: y });
		
		function in_pos_array(arr, x, y){
			for(let i = 0; i < arr.length; i++)
				if(arr[i].x === x &&
					arr[i].y === y)
					return true;
			return false;
		}

		while (to_check.length){
			let index = getRandomInt(0, to_check.length);
			let cell = to_check[index];

			let x = cell.x;
			let y = cell.y;

			maze[x][y] = false;
			yield { x: x, y: y, wall: false };
			
			to_check.splice(index, 1);

			let directs = [1, 2, 3, 4];
			
			while (directs.length){
				let dir_index = getRandomInt(0, directs.length);
				
				switch (directs[dir_index]){
					case 1: //North
						if (y - 2 >= 0 && !maze[x][y - 2]){
							maze[x][y - 1] = false;
                            yield { x: x, y: y - 1, wall: false };
							directs = [];
						}
						break;
						
					case 2: //South
						if (y + 2 < height && !maze[x][y + 2]){
							maze[x][y + 1] = false;
                            yield { x: x, y: y + 1, wall: false };
							stop = true;
							directs = [];
						}
						break;
						
					case 3: //West
						if (x - 2 >= 0 && !maze[x - 2][y]){
							maze[x - 1][y] = false;
                            yield { x: x - 1, y: y, wall: false };
							directs = [];
						}
						break;
						
					case 4: //East
						if (x + 2 < width && !maze[x + 2][y]){
							maze[x + 1][y] = false;
                            yield { x: x + 1, y: y, wall: false };
							directs = [];
						}
						break;
				};
				
				directs.splice(dir_index, 1);
			}

			if (y - 2 >= 0 && maze[x][y - 2] && !in_pos_array(to_check, x, y - 2))
				to_check.push({ x: x, y: y - 2 });
			
			if (y + 2 < height && maze[x][y + 2] && !in_pos_array(to_check, x, y + 2))
				to_check.push({ x: x, y: y + 2 });
			
			if (x - 2 >= 0 && maze[x - 2][y] && !in_pos_array(to_check, x - 2, y))
				to_check.push({ x: x - 2, y: y });
			
			if (x + 2 < width && maze[x + 2][y] && !in_pos_array(to_check, x + 2, y))
				to_check.push({ x: x + 2, y: y });
		}

		for (let i = 0; i < cut_edge; i++){
			let deads = [];

			for (let j = 0; j < height; j++){
				for (let k = 0; k < width; k++){
					if (!maze[k][j]){
						let n = 0;
						
						if (j - 1 >= 0 && !maze[k][j - 1] ||
							j + 1 < height && !maze[k][j + 1] ||
							k - 1 >= 0 && !maze[k - 1][j] ||
							k + 1 < width && !maze[k + 1][j])
							n++;
						
						if (n <= 1)
							deads.push({ x: k, y: j});
					}
				}
			}

			for (let cell of deads){
				maze[cell.x][cell.y] = true;
                yield { x: cell.x, y: cell.y, wall: true };
			}
		}
		
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