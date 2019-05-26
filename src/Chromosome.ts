import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import EventEmitter from "./EventEmitter";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";

export interface Offspring<T> {
    baby1: T[],
    baby2: T[]
}

export class Chromosome<T> extends EventEmitter<'update_fitness'> {

    private length: number;
    private genes: T[] = [];
    private fitness = 0;
    private rand_gene: () => T;

    constructor(length: number, rand_gene: () => T);
    constructor(genes: T[], rand_gene: () => T);
    constructor(length_or_genes: number | T[], rand_gene: () => T) {
        super();

        this.rand_gene = rand_gene;

        if (typeof length_or_genes === 'number') {
            this.length = length_or_genes;

            for (let i = 0; i < this.length; i++) {
                this.genes.push(rand_gene());
            }

        } else {
            this.genes = length_or_genes;
            this.length = length_or_genes.length;
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
            count += this.genes[i] !== bob.genes[i] ? 1 : 0;
        }

        return count;
    }

    private mutate_flip(mut_rate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                this.genes[i] = this.rand_gene();
            }
        }
    }

    private mutate_swap(mut_rate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mut_rate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.genes[i];

                this.genes[i] = this.genes[j];
                this.genes[j] = tmp;
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
            this.setGenes((method as CustomMutationMethod<T>)(this.getGenes()));
        }
    }

    private crossover_single_point(bob: Chromosome<T>): Offspring<T> {

        const p = Math.floor(Math.random() * this.length);

        const b1 = [...this.genes.slice(0, p), ...bob.genes.slice(p)];
        const b2 = [...bob.genes.slice(0, p), ...this.genes.slice(p)];

        return { baby1: b1, baby2: b2 };
    }

    private crossover_two_point(bob: Chromosome<T>): Offspring<T> {

        const b1: T[] = [];
        const b2: T[] = [];

        let p1 = Math.floor(Math.random() * this.length);
        let p2 = Math.floor(Math.random() * this.length);

        if (p1 > p2) [p1, p2] = [p2, p1];

        for (let i = 0; i < this.length; i++) {
            b1.push(i < p1 ? this.genes[i] : (i < p2 ? bob.genes[i] : this.genes[i]));
            b2.push(i < p1 ? bob.genes[i] : (i < p2 ? this.genes[i] : bob.genes[i]));
        }

        return { baby1: b1, baby2: b2 };
    }

    private crossover_uniform(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.genes[i] : this.genes[i]);
            b2.push(swap ? this.genes[i] : bob.genes[i]);
        }

        return { baby1: b1, baby2: b2 };
    }

    private crossover_half_uniform(bob: Chromosome<T>): Offspring<T> {
        let b1: T[] = [];
        let b2: T[] = [];

        let diff_bits: number[] = [];

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

    private crossover_ordered(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

        let inf = Math.floor(Math.random() * this.length),
            sup = Math.floor(Math.random() * this.length),
            tmp = inf;

        inf = Math.min(inf, sup);
        sup = Math.max(tmp, sup);

        for (let i = inf; i < sup; i++) {
            b1[i] = (inf <= i && i <= sup) ? bob.genes[i] : undefined;
            b2[i] = (inf <= i && i <= sup) ? this.genes[i] : undefined;
        }

        for (let i = 0; i < this.length; i++) {
            if (b1.indexOf(this.genes[i]) === -1) {
                b1[i] = this.genes[i];
            } else {
                for (let j = 0; j < this.length; j++) {
                    if (b1.indexOf(this.genes[j]) === -1) {
                        b1[i] = this.genes[j];
                    }
                }
            }

            if (b2.indexOf(bob.genes[i]) === -1) {
                b2[i] = bob.genes[i];
            } else {
                for (let j = 0; j < this.length; j++) {
                    if (b2.indexOf(bob.genes[j]) === -1) {
                        b2[i] = bob.genes[j];
                    }
                }
            }

        }

        return { baby1: b1, baby2: b2 };
    }

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

    public setGenes(genes: T[]): void {
        this.genes = [...genes];
    }

    public getGenes(): Readonly<T>[] {
        return this.genes;
    }

    public copy(bob: Chromosome<T>): void {
        this.genes = bob.genes.slice();
        this.rand_gene = bob.rand_gene;
        this.fitness = bob.fitness;
    }

    public clone(): Chromosome<T> {
        let c = new Chromosome<T>(this.length, this.rand_gene);
        c.copy(this);
        return c;
    }

}