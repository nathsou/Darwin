"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSPOptimizer = void 0;
const Darwin_1 = require("../../Darwin");
const MutationMethod_1 = require("../../MutationMethod");
const TSP_1 = require("./TSP");
const CrossoverMethods_1 = require("../../CrossoverMethods");
const Utils_1 = require("./Utils");
class TSPOptimizer {
    constructor(cities = []) {
        this.shuffled = [];
        this.model = [];
        this.convergenceThreshold = 30;
        this.maxGenerations = 5000;
        this.fitnessFactor = 15;
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP_1.TSP(cities);
        for (let i = 0; i < this.CITY_COUNT; i++) {
            this.model[i] = i;
        }
        this.genetics = new Darwin_1.Darwin({
            populationSize: 500,
            chromosomeLength: this.CITY_COUNT,
            randGene: (() => {
                if (this.shuffled.length === 0) {
                    this.shuffled = Utils_1.shuffle(this.model);
                }
                return this.shuffled.pop();
            }).bind(this),
            crossoverMethod: CrossoverMethods_1.CrossoverMethod.ORDERED,
            mutationMethod: MutationMethod_1.MutationMethod.SWAP,
            eliteCount: 5
        });
        const rectWidth = cities.reduce((a, b) => a > b.x ? a : b.x, 0);
        const rectHeight = cities.reduce((a, b) => a > b.y ? a : b.y, 0);
        this.fitnessFactor *= avgRectDist(rectWidth, rectHeight) * this.CITY_COUNT;
        this.bestPath = this.genetics.getFittest().getGenes();
    }
    pathFitness(path) {
        return Math.pow(2, (this.fitnessFactor / this.tsp.distance(path)));
    }
    distanceFromFitness(fitness) {
        return this.fitnessFactor / Math.log2(fitness);
    }
    newGen() {
        this.genetics.updateFitness(path => this.pathFitness(path));
        this.genetics.mate();
    }
    *optimize() {
        let minDist = Infinity;
        let count = 0;
        while (this.genetics.getGeneration() !== this.maxGenerations && count !== this.convergenceThreshold) {
            this.newGen();
            const fittest = this.genetics.getFittest();
            // this.distanceFromFitness(fittest.getFitness());
            const dist = this.tsp.distanceSquared(fittest.getGenes());
            if (dist >= minDist) {
                count++;
            }
            else {
                minDist = dist;
                this.bestPath = [...fittest.getGenes()];
                count = 0;
            }
            yield this.bestPath;
        }
        return this.bestPath;
    }
    drawShortestPath(ctx) {
        this.tsp.draw(ctx, this.bestPath);
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
function avgRectDist(w, h) {
    const w2 = Math.pow(w, 2);
    const w3 = Math.pow(w, 3);
    const h2 = Math.pow(h, 2);
    const h3 = Math.pow(h, 3);
    const d = Math.pow((w2 + h2), 0.5);
    return (1 / 15) * (w3 / h2 + h3 / w2 + d *
        (3 - w2 / h2 - h2 / w2) + 2.5 * ((h2 / w) *
        Math.log((w + d) / h) + (w2 / h) * Math.log((h + d) / w)));
}
