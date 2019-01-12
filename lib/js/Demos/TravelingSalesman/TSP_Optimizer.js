"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Darwin_1 = require("../../Darwin");
const MutationMethod_1 = require("../../MutationMethod");
const TSP_1 = require("./TSP");
const CrossoverMethods_1 = require("../../CrossoverMethods");
const Utils_1 = require("./Utils");
class TSP_Optimizer {
    constructor(cities = []) {
        this.shuffled = [];
        this.model = [];
        this.convergence_treshold = 30;
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
            rand_func: (() => {
                if (this.shuffled.length === 0)
                    this.shuffled = Utils_1.shuffle(this.model.slice());
                return this.shuffled.pop();
            }).bind(this),
            crossover_method: CrossoverMethods_1.CrossoverMethod.ORDERED,
            mutation_method: MutationMethod_1.MutationMethod.SWAP,
            elite_count: 5
        });
        let rect_w = cities.reduce((a, b) => a > b.x ? a : b.x, 0), rect_h = cities.reduce((a, b) => a > b.y ? a : b.y, 0);
        this.fitness_k *= avg_dist_rect(rect_w, rect_h) * this.CITY_COUNT;
    }
    newGen() {
        this.genetics.updateFitness(path => {
            const d = this.tsp.distance(path);
            return Math.pow(2, ((this.fitness_k / d)));
        });
        this.genetics.mate();
        if (this.genetics.getGeneration() % 100 === 0) {
            console.log(`generation ${this.genetics.getGeneration()},
                            fittest: ${this.genetics.getFittest().getFitness().toFixed(4)}
                            avg: ${this.genetics.getAverageFitness().toFixed(4)}`);
        }
    }
    *optimize() {
        let fittest = 0, count = 0;
        while (this.genetics.getGeneration() !== this.max_generation && count !== this.convergence_treshold) {
            this.newGen();
            if (fittest === this.genetics.getFittest().getFitness()) {
                count++;
            }
            else {
                fittest = this.genetics.getFittest().getFitness();
                count = 0;
            }
            yield this.genetics.getFittest().getBits();
        }
        return this.genetics.getFittest().getBits();
    }
    drawShortestPath(ctx) {
        this.tsp.draw(ctx, this.genetics.getFittest().getBits());
        ctx.fillStyle = 'black';
        ctx.fillText(`generation ${this.genetics.getGeneration()}`, 5, 15);
    }
    getGeneration() {
        return this.genetics.getGeneration();
    }
}
exports.TSP_Optimizer = TSP_Optimizer;
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
