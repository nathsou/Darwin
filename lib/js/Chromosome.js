"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chromosome = void 0;
const CrossoverMethods_1 = require("./CrossoverMethods");
const EventEmitter_1 = require("./EventEmitter");
const MutationMethod_1 = require("./MutationMethod");
class Chromosome extends EventEmitter_1.default {
    constructor(genes, randGene) {
        super();
        this.genes = [];
        this.fitness = 0;
        this.randGene = randGene;
        this.genes = genes;
        this.length = genes.length;
    }
    static generate(count, randGene) {
        const genes = [];
        for (let i = 0; i < count; i++) {
            genes.push(randGene());
        }
        return new Chromosome(genes, randGene);
    }
    getFitness() {
        return this.fitness;
    }
    setFitness(f) {
        this.fitness = f;
        this.emit('update_fitness', f);
    }
    // returns the number of bits which are different = Hamming distance
    compare(bob) {
        let count = 0;
        for (let i = 0; i < Math.min(this.length, bob.length); i++) {
            count += this.genes[i] !== bob.genes[i] ? 1 : 0;
        }
        return count;
    }
    mutateFlip(mutationRate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mutationRate) {
                this.genes[i] = this.randGene();
            }
        }
    }
    mutateSwap(mutationRate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mutationRate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.genes[i];
                this.genes[i] = this.genes[j];
                this.genes[j] = tmp;
            }
        }
    }
    mutate(mutationRate = 1 / this.length, method) {
        if (typeof method === 'number') {
            switch (method) {
                case MutationMethod_1.MutationMethod.FLIP:
                    this.mutateFlip(mutationRate);
                    break;
                case MutationMethod_1.MutationMethod.SWAP:
                    this.mutateSwap(mutationRate);
                    break;
            }
        }
        else {
            this.setGenes(method(this.getGenes()));
        }
    }
    crossoverSinglePoint(bob) {
        const p = Math.floor(Math.random() * this.length);
        const b1 = [...this.genes.slice(0, p), ...bob.genes.slice(p)];
        const b2 = [...bob.genes.slice(0, p), ...this.genes.slice(p)];
        return [b1, b2];
    }
    crossoverTwoPoint(bob) {
        const b1 = [];
        const b2 = [];
        let p1 = Math.floor(Math.random() * this.length);
        let p2 = Math.floor(Math.random() * this.length);
        if (p1 > p2) {
            [p1, p2] = [p2, p1];
        }
        for (let i = 0; i < this.length; i++) {
            b1.push(i < p1 ? this.genes[i] : (i < p2 ? bob.genes[i] : this.genes[i]));
            b2.push(i < p1 ? bob.genes[i] : (i < p2 ? this.genes[i] : bob.genes[i]));
        }
        return [b1, b2];
    }
    crossoverUniform(bob) {
        const b1 = [];
        const b2 = [];
        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.genes[i] : this.genes[i]);
            b2.push(swap ? this.genes[i] : bob.genes[i]);
        }
        return [b1, b2];
    }
    crossoverHalfUniform(bob) {
        let b1 = [];
        let b2 = [];
        const diffBits = [];
        for (let i = 0; i < this.length; i++) {
            if (this.genes[i] !== bob.genes[i]) {
                diffBits.push(i);
            }
        }
        const N = diffBits.length;
        b1 = this.genes.slice();
        b2 = bob.genes.slice();
        for (let i = 0; i < N / 2; i++) {
            let idx = Math.floor(Math.random() * diffBits.length);
            b1[diffBits[idx]] = bob.genes[diffBits[idx]];
            b2[diffBits[idx]] = this.genes[diffBits[idx]];
            diffBits.splice(idx, 1);
        }
        return [b1, b2];
    }
    crossoverOrdered(bob) {
        const b1 = [];
        const b2 = [];
        let inf = Math.floor(Math.random() * this.length);
        let sup = Math.floor(Math.random() * this.length);
        let tmp = inf;
        inf = Math.min(inf, sup);
        sup = Math.max(tmp, sup);
        for (let i = inf; i < sup; i++) {
            b1[i] = bob.genes[i];
            b2[i] = this.genes[i];
        }
        for (let i = 0; i < this.length; i++) {
            if (b1.indexOf(this.genes[i]) === -1) {
                b1[i] = this.genes[i];
            }
            else {
                for (let j = 0; j < this.length; j++) {
                    if (b1.indexOf(this.genes[j]) === -1) {
                        b1[i] = this.genes[j];
                    }
                }
            }
            if (b2.indexOf(bob.genes[i]) === -1) {
                b2[i] = bob.genes[i];
            }
            else {
                for (let j = 0; j < this.length; j++) {
                    if (b2.indexOf(bob.genes[j]) === -1) {
                        b2[i] = bob.genes[j];
                    }
                }
            }
        }
        return [b1, b2];
    }
    crossover(bob, method) {
        if (typeof method === 'number') {
            switch (method) {
                case CrossoverMethods_1.CrossoverMethod.SINGLE_POINT:
                    return this.crossoverSinglePoint(bob);
                case CrossoverMethods_1.CrossoverMethod.TWO_POINT:
                    return this.crossoverTwoPoint(bob);
                case CrossoverMethods_1.CrossoverMethod.UNIFORM:
                    return this.crossoverUniform(bob);
                case CrossoverMethods_1.CrossoverMethod.HALF_UNIFORM:
                    return this.crossoverHalfUniform(bob);
                case CrossoverMethods_1.CrossoverMethod.ORDERED:
                    return this.crossoverOrdered(bob);
                default:
                    throw new Error(`Unimplemented CrossoverMethod: ${method} (${CrossoverMethods_1.CrossoverMethod[method]})`);
            }
        }
        return method(bob);
    }
    setGenes(genes) {
        this.genes = [...genes];
    }
    getGenes() {
        return this.genes;
    }
    copy(bob) {
        this.genes = bob.genes.slice();
        this.length = bob.length;
        this.randGene = bob.randGene;
        this.fitness = bob.fitness;
    }
    clone() {
        const clone = Chromosome.generate(this.length, this.randGene);
        clone.copy(this);
        return clone;
    }
}
exports.Chromosome = Chromosome;
