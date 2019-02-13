"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MutationMethod_1 = require("./MutationMethod");
const CrossoverMethods_1 = require("./CrossoverMethods");
const EventEmitter_1 = require("./EventEmitter");
class Chromosome extends EventEmitter_1.EventEmitter {
    constructor(length_or_bits, rand_func) {
        super();
        this.bits = [];
        this.fitness = 0;
        this.rand_func = rand_func;
        if (typeof length_or_bits === 'number') {
            this.length = length_or_bits;
            for (let i = 0; i < this.length; i++) {
                this.bits.push(rand_func());
            }
        }
        else {
            this.bits = length_or_bits;
            this.length = length_or_bits.length;
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
            count += this.bits[i] !== bob.bits[i] ? 1 : 0;
        }
        return count;
    }
    mutate_flip(mut_rate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                this.bits[i] = this.rand_func();
            }
        }
    }
    mutate_swap(mut_rate) {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.bits[i];
                this.bits[i] = this.bits[j];
                this.bits[j] = tmp;
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
            this.setBits(method(this.getGenes()));
        }
    }
    crossover_single_point(bob) {
        const b1 = [];
        const b2 = [];
        const p = Math.floor(Math.random() * this.length);
        for (let i = 0; i < this.length; i++) {
            b1.push(i < p ? this.bits[i] : bob.bits[i]);
            b2.push(i < p ? bob.bits[i] : this.bits[i]);
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_two_point(bob) {
        const b1 = [];
        const b2 = [];
        let p1 = Math.floor(Math.random() * this.length);
        let p2 = Math.floor(Math.random() * this.length);
        if (p1 > p2) {
            const c = p2;
            p2 = p1;
            p1 = c;
        }
        for (let i = 0; i < this.length; i++) {
            b1.push(i < p1 ? this.bits[i] : (i < p2 ? bob.bits[i] : this.bits[i]));
            b2.push(i < p1 ? bob.bits[i] : (i < p2 ? this.bits[i] : bob.bits[i]));
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_uniform(bob) {
        const b1 = [];
        const b2 = [];
        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.bits[i] : this.bits[i]);
            b2.push(swap ? this.bits[i] : bob.bits[i]);
        }
        return { baby1: b1, baby2: b2 };
    }
    crossover_half_uniform(bob) {
        let b1 = [];
        let b2 = [];
        let diff_bits = [];
        for (let i = 0; i < this.length; i++)
            if (this.bits[i] !== bob.bits[i])
                diff_bits.push(i);
        let N = diff_bits.length;
        b1 = this.bits.slice();
        b2 = bob.bits.slice();
        for (let i = 0; i < N / 2; i++) {
            let idx = Math.floor(Math.random() * diff_bits.length);
            b1[diff_bits[idx]] = bob.bits[diff_bits[idx]];
            b2[diff_bits[idx]] = this.bits[diff_bits[idx]];
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
            b1[i] = (inf <= i && i <= sup) ? bob.bits[i] : undefined;
            b2[i] = (inf <= i && i <= sup) ? this.bits[i] : undefined;
        }
        for (let i = 0; i < this.length; i++) {
            if (b1.indexOf(this.bits[i]) === -1) {
                b1[i] = this.bits[i];
            }
            else {
                for (let j = 0; j < this.length; j++) {
                    if (b1.indexOf(this.bits[j]) === -1) {
                        b1[i] = this.bits[j];
                    }
                }
            }
            if (b2.indexOf(bob.bits[i]) === -1) {
                b2[i] = bob.bits[i];
            }
            else {
                for (let j = 0; j < this.length; j++) {
                    if (b2.indexOf(bob.bits[j]) === -1) {
                        b2[i] = bob.bits[j];
                    }
                }
            }
        }
        return { baby1: b1, baby2: b2 };
    }
    // public crossover(bob: Chromosome<T>, method: CrossoverMethod): Offspring<T>;
    // public crossover(bob: Chromosome<T>, method: CustomCrossoverMethod<T>): Offspring<T>;
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
    setBits(bits) {
        this.bits = [...bits];
    }
    getGenes() {
        return this.bits;
    }
    copy(bob) {
        this.bits = bob.bits.slice();
        this.rand_func = bob.rand_func;
        this.fitness = bob.fitness;
    }
    clone() {
        let c = new Chromosome(this.length, this.rand_func);
        c.copy(this);
        return c;
    }
}
exports.Chromosome = Chromosome;
