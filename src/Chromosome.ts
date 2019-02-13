import { MutationMethod, CustomMutationMethod } from "./MutationMethod";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { EventEmitter } from "./EventEmitter";

export interface Offspring<T> {
    baby1: T[],
    baby2: T[]
}

export class Chromosome<T> extends EventEmitter {

    private length: number;
    private bits: T[] = [];
    private fitness = 0;
    private rand_func: () => T;

    constructor(length_or_bits: number | T[], rand_func: () => T) {
        super();

        this.rand_func = rand_func;

        if (typeof length_or_bits === 'number') {
            this.length = length_or_bits;

            for (let i = 0; i < this.length; i++) {
                this.bits.push(rand_func());
            }

        } else {
            this.bits = length_or_bits;
            this.length = length_or_bits.length;
        }
    }

    public getFitness(): number {
        return this.fitness;
    }

    public setFitness(f: number): void {
        this.fitness = f;
        this.emit('update_fitness', f);
    }

    // returns the number of bits which are different = Hamming distance
    public compare(bob: Chromosome<T>): number {

        let count = 0;

        for (let i = 0; i < Math.min(this.length, bob.length); i++) {
            count += this.bits[i] !== bob.bits[i] ? 1 : 0;
        }

        return count;
    }

    private mutate_flip(mut_rate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                this.bits[i] = this.rand_func();
            }
        }
    }

    private mutate_swap(mut_rate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.bits[i];

                this.bits[i] = this.bits[j];
                this.bits[j] = tmp;
            }
        }
    }

    public mutate(mut_rate = 1 / this.length, method: MutationMethod | CustomMutationMethod<T>): void {

        if (typeof method === 'number') {
            switch (method) {
                case MutationMethod.FLIP:
                    this.mutate_flip(mut_rate);
                    break;

                case MutationMethod.SWAP:
                    this.mutate_swap(mut_rate);
                    break;
            }
        } else {
            this.setBits((method as CustomMutationMethod<T>)(this.getGenes()));
        }
    }

    private crossover_single_point(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];
        const p = Math.floor(Math.random() * this.length);

        for (let i = 0; i < this.length; i++) {
            b1.push(i < p ? this.bits[i] : bob.bits[i]);
            b2.push(i < p ? bob.bits[i] : this.bits[i]);
        }

        return { baby1: b1, baby2: b2 };
    }

    private crossover_two_point(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

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

    private crossover_uniform(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.bits[i] : this.bits[i]);
            b2.push(swap ? this.bits[i] : bob.bits[i]);
        }

        return { baby1: b1, baby2: b2 };
    }

    private crossover_half_uniform(bob: Chromosome<T>): Offspring<T> {
        let b1: T[] = [];
        let b2: T[] = [];

        let diff_bits: number[] = [];

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

    private crossover_ordered(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

        let inf = Math.floor(Math.random() * this.length),
            sup = Math.floor(Math.random() * this.length),
            tmp = inf;

        inf = Math.min(inf, sup);
        sup = Math.max(tmp, sup);

        for (let i = inf; i < sup; i++) {
            b1[i] = (inf <= i && i <= sup) ? bob.bits[i] : undefined;
            b2[i] = (inf <= i && i <= sup) ? this.bits[i] : undefined;
        }

        for (let i = 0; i < this.length; i++) {
            if (b1.indexOf(this.bits[i]) === -1) {
                b1[i] = this.bits[i];
            } else {
                for (let j = 0; j < this.length; j++) {
                    if (b1.indexOf(this.bits[j]) === -1) {
                        b1[i] = this.bits[j];
                    }
                }
            }

            if (b2.indexOf(bob.bits[i]) === -1) {
                b2[i] = bob.bits[i];
            } else {
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

    public crossover(bob: Chromosome<T>, method: CrossoverMethod | CustomCrossoverMethod<T>): Offspring<T> {

        if (typeof method === 'number') {
            switch (method) {
                case CrossoverMethod.SINGLE_POINT:
                    return this.crossover_single_point(bob);

                case CrossoverMethod.TWO_POINT:
                    return this.crossover_two_point(bob);

                case CrossoverMethod.UNIFORM:
                    return this.crossover_uniform(bob);

                case CrossoverMethod.HALF_UNIFORM:
                    return this.crossover_half_uniform(bob);

                case CrossoverMethod.ORDERED:
                    return this.crossover_ordered(bob);
                default:
                    throw new Error(`Unimplemented CrossoverMethod: ${method} (${CrossoverMethod[method]})`);
            }
        }

        return method(bob);
    }

    public setBits(bits: T[]): void {
        this.bits = [...bits];
    }

    public getGenes(): Readonly<T[]> {
        return this.bits;
    }

    public copy(bob: Chromosome<T>): void {
        this.bits = bob.bits.slice();
        this.rand_func = bob.rand_func;
        this.fitness = bob.fitness;
    }

    public clone(): Chromosome<T> {
        let c = new Chromosome<T>(this.length, this.rand_func);
        c.copy(this);
        return c;
    }

}