import { CrossoverFunction } from "./CrossoverMethods";
import EventEmitter from "./EventEmitter";
import { MutationFunction } from "./MutationMethod";

export type Offspring<T> = [baby1: T[], baby2: T[]];

export class Chromosome<T> extends EventEmitter<'update_fitness'> {
    private length: number;
    private genes: T[] = [];
    private fitness = 0;
    private randGene: () => T;
    private randNum: () => number;

    constructor(genes: T[], randomGene: () => T, randomNumber: () => number) {
        super();

        this.randGene = randomGene;
        this.randNum = randomNumber;
        this.genes = genes;
        this.length = genes.length;
    }

    public static generate<T>(count: number, randGene: () => T, randomNumber: () => number) {
        const genes: T[] = [];
        for (let i = 0; i < count; i++) {
            genes.push(randGene());
        }

        return new Chromosome<T>(genes, randGene, randomNumber);
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

    public mutateWith(mutationRate = 1 / this.length, mutateFn: MutationFunction<T>): void {
        mutateFn(this, mutationRate);
    }

    public crossoverWith(bob: Chromosome<T>, crossoverFn: CrossoverFunction<T>): Offspring<T> {
        return crossoverFn(this, bob);
    }

    public setGenes(genes: T[]): void {
        this.genes = [...genes];
    }

    public getGenes(): T[] {
        return this.genes;
    }

    public copy(bob: Chromosome<T>): void {
        this.genes = bob.genes.slice();
        this.length = bob.length;
        this.randGene = bob.randGene;
        this.fitness = bob.fitness;
    }

    public clone(): Chromosome<T> {
        const clone = Chromosome.generate(
            this.length,
            this.randGene,
            this.randNum
        );

        clone.copy(this);
        return clone;
    }

    public randomGene(): T {
        return this.randGene();
    }

    public randomNumber(): number {
        return this.randNum();
    }
}