import {Matrix} from "../_helpers/Matrix";

export class Algo_Genetics {
    point = [];
    count_point = 0;
    matrix_output = [];
    matrix_adjacency = [];

    constructor(matrix) {
        this.matrix_input = matrix;
        this.width = matrix.length;
        this.height = matrix[0].length;
        this.matrix_output = new Matrix(matrix.length, matrix[0].length, 0);
        this._search_points();
        this._set_matrix_adjacency();

        this.onstart = null;
        this.onend = null;
        this.ondraw = null;
    }

    * update() {
        if (this.onstart instanceof Function)
            this.onstart.call(this)();

        while (true) {
            /* code... */

            let ret;
            //ret = new Matrix(10, 10); /* from Matrix.js */
            //ret = new LinearMatrix(10, { x:0, y:0 }); /* from LinearMatrix.js */

            if (this.ondraw instanceof Function)
                this.ondraw.call(this, ret /* return val on draw */);
        }

        if (this.onend instanceof Function)
            this.onend.call(this);
    }

    _search_points() {
        this.count_point = 0;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.matrix_input[i][j] != 0) {
                    this.point[this.count_point] = {
                        x: i,
                        y: j,
                    };
                    this.count_point++;
                    this.matrix_output[i][j] = -1;
                }
            }
        }
    }

    _get_dist(point1 = {}, point2 = {}) {
        let res;
        res = Math.floor(((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2));
        return res;
    }

    _set_matrix_adjacency() {
        this.matrix_adjacency = new Matrix(this.point.length, this.point.length, 0);
        for (let i = 0; i < this.point.length; i++) {
            for (let j = 0; j < this.point.length; j++) {
                this.matrix_adjacency[i][j] = this._get_dist(this.point[i], this.point[j]);
            }
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
        for (let i = 0; i <= flag + 1; i++) {
            child1.route.push(parent1.route[i]);
            check[parent1.route[i]] = 1;
        }
        for(let i = 0;i<parent1.route.length;i++){
            if(check[parent2.route[i]]==0){
                child1.route.push(parent2.route[i]);
                check[parent2.route[i]]=1;
            }
        }
        descendants.push(child1);
        let child2 = {
            fp: parent1.fp,
            route: [],
            route_length: 0,
        }
        check = [];
        for (let i = 0; i < parent1.route.length + 1; i++) {
            if (i == parent1.fp) check[i] = -1;
            else check[i] = 0;
        }
        for (let i = 0; i <= flag + 1; i++) {
            child2.route.push(parent2.route[i]);
            check[parent2.route[i]] = 1;
        }
        for(let i = 0;i<parent1.route.length;i++){
            if(check[parent1.route[i]]==0){
                child2.route.push(parent1.route[i]);
                check[parent1.route[i]]=1;
            }
        }
        descendants.push(child2);
    }

    _mutation(descendant, flag1, flag2) {//мутиция
        let temp;
        while(flag1<flag2){
            temp=descendant.route[flag1];
            descendant.route[flag1]=descendant.route[flag2];
            descendant.route[flag2]=temp;
            flag1++;
            flag2--;
        }
    }

    _selection(population, descendants) {//селекция
        for(let i=0;i<descendants.length;i++){
            if(descendants[i]<population[population.length-1]){
                population[population.length-1]=descendants[i];
                this._sort_population(population);
            }
        }
        descendants=[];
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

    genetic(first_point, population_size) {//основной алгоритм
        let index_fp;
        for (let i = 0; i < this.point.length; i++) {
            if (first_point.x == this.point[i].x && first_point.y == this.point[i].y) {
                index_fp = i;
            }
        }
        let population = [];
        for (let i = 0; i < population_size; i++) {//генерируем популяцию
            population[i] = {
                fp: index_fp,//начальная точка
                route: [],
                route_length: 0,
            }
            for (let p = 0; p < this.point.length - 1; p++) {
                population[i].route[p] = -1;
            }
            for (let p = 0; p < this.point.length; p++) {
                let check = false;
                if (p != index_fp) {
                    while (check != true) {
                        let index = Math.floor(Math.random() * (this.point.length-1));
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
        //console.log(population);

        let count_repeat=0;
        while (count_repeat<100) {
            let descendants = [];

            let check = [];
            let parent1 = undefined;
            let parent2 = undefined;
            let count_use_parent = 0;
            let id_parent;
            for(let i=0;i<population.length;i++){
                check[i]=0;
            }
            while (count_use_parent<population.length){
                id_parent = Math.floor(Math.random() * population.length);
                if(parent1==undefined){
                    if(check[id_parent]==0){
                        parent1=population[id_parent];
                        count_use_parent++;
                    }
                }else if(parent2==undefined){
                    if(check[id_parent]==0){
                        parent2=population[id_parent];
                        count_use_parent++;
                        let flag=Math.floor(Math.random() * population[0].route.length);
                        this._crossover(parent1,parent2,descendants, flag);
                        parent1=undefined;
                        parent2=undefined;
                    }
                }
            }

            for(let i=0;i<descendants.length;i++){
                let flag1 = Math.floor(Math.random() * (population[0].route.length - 1));//Math.floor(Math.random() * (max - min)) + min
                let flag2 = Math.floor(Math.random() * (population[0].route.length - flag1)) + flag1;
                this._mutation(descendants[i], flag1, flag2);
            }

            let best_route = population[0].route_length;
            this._selection(population, descendants);
            if(best_route==population[0].route_length) count_repeat++;
            else count_repeat=0;
            /*
                в каком формате отдавать лучшую особь?
                - матрица со значением в порядке возрастания?
                - массив точек?(довавить им свойство порядок посещения+координаты)

             */
        }
        this._sort_population(population)
        return population[0];
    }

}