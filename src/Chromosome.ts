import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import EventEmitter from "./EventEmitter";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";

export type Offspring<T> = [baby1: T[], baby2: T[]];

export class Chromosome<T> extends EventEmitter<'update_fitness'> {
    private length: number;
    private genes: T[] = [];
    private fitness = 0;
    private randGene: () => T;

    constructor(genes: T[], randGene: () => T) {
        super();

        this.randGene = randGene;
        this.genes = genes;
        this.length = genes.length;
    }

    public static generate<T>(count: number, randGene: () => T) {
        const genes: T[] = [];
        for (let i = 0; i < count; i++) {
            genes.push(randGene());
        }

        return new Chromosome<T>(genes, randGene);
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

    private mutateFlip(mutationRate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mutationRate) {
                this.genes[i] = this.randGene();
            }
        }
    }

    private mutateSwap(mutationRate: number): void {
        for (let i = 0; i < this.length; i++) {
            if (Math.random() < mutationRate) {
                const j = Math.floor(Math.random() * this.length);
                const tmp = this.genes[i];

                this.genes[i] = this.genes[j];
                this.genes[j] = tmp;
            }
        }
    }

    public mutate(mutationRate = 1 / this.length, method: MutationMethod | CustomMutationMethod<T>): void {
        if (typeof method === 'number') {
            switch (method) {
                case MutationMethod.FLIP:
                    this.mutateFlip(mutationRate);
                    break;

                case MutationMethod.SWAP:
                    this.mutateSwap(mutationRate);
                    break;
            }
        } else {
            this.setGenes((method as CustomMutationMethod<T>)(this.getGenes()));
        }
    }

    private crossoverSinglePoint(bob: Chromosome<T>): Offspring<T> {
        const p = Math.floor(Math.random() * this.length);
        const b1 = [...this.genes.slice(0, p), ...bob.genes.slice(p)];
        const b2 = [...bob.genes.slice(0, p), ...this.genes.slice(p)];

        return [b1, b2];
    }

    private crossoverTwoPoint(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

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

    private crossoverUniform(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

        for (let i = 0; i < this.length; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bob.genes[i] : this.genes[i]);
            b2.push(swap ? this.genes[i] : bob.genes[i]);
        }

        return [b1, b2];
    }

    private crossoverHalfUniform(bob: Chromosome<T>): Offspring<T> {
        let b1: T[] = [];
        let b2: T[] = [];

        const diffBits: number[] = [];

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

    private crossoverOrdered(bob: Chromosome<T>): Offspring<T> {
        const b1: T[] = [];
        const b2: T[] = [];

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

        return [b1, b2];
    }

    public crossover(bob: Chromosome<T>, method: CrossoverMethod | CustomCrossoverMethod<T>): Offspring<T> {
        if (typeof method === 'number') {
            switch (method) {
                case CrossoverMethod.SINGLE_POINT:
                    return this.crossoverSinglePoint(bob);

                case CrossoverMethod.TWO_POINT:
                    return this.crossoverTwoPoint(bob);

                case CrossoverMethod.UNIFORM:
                    return this.crossoverUniform(bob);

                case CrossoverMethod.HALF_UNIFORM:
                    return this.crossoverHalfUniform(bob);

                case CrossoverMethod.ORDERED:
                    return this.crossoverOrdered(bob);
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
        this.length = bob.length;
        this.randGene = bob.randGene;
        this.fitness = bob.fitness;
    }

    public clone(): Chromosome<T> {
        const clone = Chromosome.generate(this.length, this.randGene);
        clone.copy(this);
        return clone;
    }
}