"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CrossoverMethods_1 = require("./CrossoverMethods");
const EventEmitter_1 = require("./EventEmitter");
const MutationMethod_1 = require("./MutationMethod");
class Chromosome extends EventEmitter_1.default {
    constructor(length_or_genes, rand_gene) {
        super();
        this.genes = [];
        this.fitness = 0;
        this.rand_gene = rand_gene;
        if (typeof length_or_genes === 'number') {
            this.length = length_or_genes;
            for (let i = 0; i < this.length; i++) {
                this.genes.push(rand_gene());
            }
        }
        else {
            this.genes = length_or_genes;
            this.length = length_or_genes.length;
        }
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
    mutate_flip(mut_rate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                this.genes[i] = this.rand_gene();
            }
        }
    }
    mutate_swap(mut_rate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.genes[i];
                this.genes[i] = this.genes[j];
                this.genes[j] = tmp;
            }
        }
    }
    mutate(mut_rate = 1 / this.length, method) {
        if (typeof method === 'number') {
            switch (method) {
                case MutationMethod_1.MutationMethod.FLIP:
                    this.mutate_flip(mut_rate);
                    break;
                case MutationMethod_1.MutationMethod.SWAP:
                    this.mutate_swap(mut_rate);
                    break;
            }
        }
        else {
            this.setGenes(method(this.getGenes()));
        }
    }
    crossover_single_point(bob) {
        const p = Math.floor(Math.random() * this.length);
        const b1 = [...this.genes.slice(0, p), ...bob.genes.slice(p)];
        const b2 = [...bob.genes.slice(0, p), ...this.genes.slice(p)];
        return { baby1: b1, baby2: b2 };
    }
    crossover_two_point(bob) {
        const b1 = [];
        const b2 = [];
        let p1 = Math.floor(Math.random() * this.length);
        let p2 = Math.floor(Math.random() * this.length);
        if (p1 > p2)
            [p1, p2] = [p2, p1];
        for (let i = 0; i < this.length; i++) {
            b1.push(i < p1 ? this.genes[i] : (i < p2 ? bob.genes[i] : this.genes[i]));
            b2.push(i < p1 ? bob.genes[i] : (i < p2 ? this.genes[i] : bob.genes[i]));
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_uniform(bob) {
        const b1 = [];
        const b2 = [];
        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.genes[i] : this.genes[i]);
            b2.push(swap ? this.genes[i] : bob.genes[i]);
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_half_uniform(bob) {
        let b1 = [];
        let b2 = [];
        let diff_bits = [];
        for (let i = 0; i < this.length; i++)
            if (this.genes[i] !== bob.genes[i])
                diff_bits.push(i);
        let N = diff_bits.length;
        b1 = this.genes.slice();
        b2 = bob.genes.slice();
        for (let i = 0; i < N / 2; i++) {
            let idx = Math.floor(Math.random() * diff_bits.length);
            b1[diff_bits[idx]] = bob.genes[diff_bits[idx]];
            b2[diff_bits[idx]] = this.genes[diff_bits[idx]];
            diff_bits.splice(idx, 1);
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_ordered(bob) {
        const b1 = [];
        const b2 = [];
        let inf = Math.floor(Math.random() * this.length), sup = Math.floor(Math.random() * this.length), tmp = inf;
        inf = Math.min(inf, sup);
        sup = Math.max(tmp, sup);
        for (let i = inf; i < sup; i++) {
            b1[i] = (inf <= i && i <= sup) ? bob.genes[i] : undefined;
            b2[i] = (inf <= i && i <= sup) ? this.genes[i] : undefined;
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
        return { baby1: b1, baby2: b2 };
    }
    crossover(bob, method) {
        if (typeof method === 'number') {
            switch (method) {
                case CrossoverMethods_1.CrossoverMethod.SINGLE_POINT:
                    return this.crossover_single_point(bob);
                case CrossoverMethods_1.CrossoverMethod.TWO_POINT:
                    return this.crossover_two_point(bob);
                case CrossoverMethods_1.CrossoverMethod.UNIFORM:
                    return this.crossover_uniform(bob);
                case CrossoverMethods_1.CrossoverMethod.HALF_UNIFORM:
                    return this.crossover_half_uniform(bob);
                case CrossoverMethods_1.CrossoverMethod.ORDERED:
                    return this.crossover_ordered(bob);
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
        this.rand_gene = bob.rand_gene;
        this.fitness = bob.fitness;
    }
    clone() {
        let c = new Chromosome(this.length, this.rand_gene);
        c.copy(this);
        return c;
    }
}
exports.Chromosome = Chromosome;
