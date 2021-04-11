import { CrossoverFunction } from "./CrossoverMethods";
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

    public crossoverWith(bob: Chromosome<T>, method: CrossoverFunction<T>): Offspring<T> {
        return method(this, bob);
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