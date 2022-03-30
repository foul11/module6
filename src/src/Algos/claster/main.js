import {Matrix} from "../_helpers/Matrix";

export class Algo_Claster {
    points = [];
    count_point = 0;

    constructor(matrix) {
        this.matrix_input = matrix;
        this.width = matrix.length;
        this.height = matrix[0].length;
        this.matrix_output = new Matrix(matrix.length, matrix[0].length, 0);
        this._search_points();

        this.onstart = null;
        this.onend = null;
        this.ondraw = null;
    }

    k_means(count_claster) {//count_claster - количество кластеров
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
                    if (this._get_dist(this.points[i], centre_claster[j]) < min_dist) {
                        min_dist = this._get_dist(this.points[i], centre_claster[j]);
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
        }
        return this.points;
    }

    agglomerative(count_claster, max_dist) {//count_claster - количество , max_dist - порог расстояния (нужно передать один из них, второй пришли underfined)
        return this.points;
    }

    connect_components(max_dist){//max_dist - порог расстояния
        return this.points;
    }

    min_cover_tree(count_claster, max_dist){//count_claster - количество , max_dist - порог расстояния (нужно передать один из них, второй пришли underfined)
        return this.points;
    }

    layered(max_dists){//max_dist - последлвательность порогов расстояния
        return this.points;
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

    _get_dist(point1 = {}, point2 = {}) {
        let res;
        res = ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** (1 / 2);
        return res;
    }
}