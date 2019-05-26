"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Darwin_1 = require("../../Darwin");
const MutationMethod_1 = require("../../MutationMethod");
const TSP_1 = require("./TSP");
const CrossoverMethods_1 = require("../../CrossoverMethods");
const Utils_1 = require("./Utils");
class TSPOptimizer {
    constructor(cities = []) {
        this.shuffled = [];
        this.model = [];
        this.convergence_threshold = 30;
        this.max_generation = 5000;
        this.fitness_k = 15;
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP_1.TSP(cities);
        for (let i = 0; i < this.CITY_COUNT; i++) {
            this.model[i] = i;
        }
        this.genetics = new Darwin_1.Darwin({
            population_size: 500,
            chromosome_length: this.CITY_COUNT,
            rand_gene: (() => {
                if (this.shuffled.length === 0) {
                    this.shuffled = Utils_1.shuffle(this.model);
                }
                return this.shuffled.pop();
            }).bind(this),
            crossover_method: CrossoverMethods_1.CrossoverMethod.ORDERED,
            mutation_method: MutationMethod_1.MutationMethod.SWAP,
            elite_count: 5
        });
        let rect_w = cities.reduce((a, b) => a > b.x ? a : b.x, 0), rect_h = cities.reduce((a, b) => a > b.y ? a : b.y, 0);
        this.fitness_k *= avg_dist_rect(rect_w, rect_h) * this.CITY_COUNT;
        this.best_path = this.genetics.getFittest().getGenes();
    }
    pathFitness(path) {
        return Math.pow(2, (this.fitness_k / this.tsp.distance(path)));
    }
    distanceFromFitness(fitness) {
        return this.fitness_k / Math.log2(fitness);
    }
    newGen() {
        this.genetics.updateFitness(path => this.pathFitness(path));
        this.genetics.mate();
    }
    *optimize() {
        let min_dist = Infinity, count = 0;
        while (this.genetics.getGeneration() !== this.max_generation && count !== this.convergence_threshold) {
            this.newGen();
            const fittest = this.genetics.getFittest();
            const dist = this.tsp.distance_squared(fittest.getGenes()); // this.distanceFromFitness(fittest.getFitness());
            if (dist >= min_dist) {
                count++;
            }
            else {
                min_dist = dist;
                this.best_path = [...fittest.getGenes()];
                count = 0;
            }
            yield this.best_path;
        }
        return this.best_path;
    }
    drawShortestPath(ctx) {
        this.tsp.draw(ctx, this.best_path);
        ctx.fillStyle = 'black';
        ctx.fillText(`generation : ${this.genetics.getGeneration()}`, 5, 15);
        ctx.fillText(`avg dist : ${this.distanceFromFitness(this.genetics.getAverageFitness()).toFixed(0)}`, 5, 30);
    }
    getGeneration() {
        return this.genetics.getGeneration();
    }
}
exports.TSPOptimizer = TSPOptimizer;
//http://www.math.uni-muenster.de/reine/u/burgstal/d18.pdf
function avg_dist_rect(w, h) {
    const w2 = Math.pow(w, 2);
    const w3 = Math.pow(w, 3);
    const h2 = Math.pow(h, 2);
    const h3 = Math.pow(h, 3);
    const d = Math.pow((w2 + h2), 0.5);
    return (1 / 15) * (w3 / h2 + h3 / w2 + d *
        (3 - w2 / h2 - h2 / w2) + 2.5 * ((h2 / w) *
        Math.log((w + d) / h) + (w2 / h) * Math.log((h + d) / w)));
}
