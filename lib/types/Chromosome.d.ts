import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import EventEmitter from "./EventEmitter";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
export declare type Offspring<T> = [baby1: T[], baby2: T[]];
export declare class Chromosome<T> extends EventEmitter<'update_fitness'> {
    private length;
    private genes;
    private fitness;
    private randGene;
    constructor(genes: T[], randGene: () => T);
    static generate<T>(count: number, randGene: () => T): Chromosome<T>;
    getFitness(): number;
    setFitness(f: number): void;
    compare(bob: Chromosome<T>): number;
    private mutateFlip;
    private mutateSwap;
    mutate(mutationRate: number | undefined, method: MutationMethod | CustomMutationMethod<T>): void;
    private crossoverSinglePoint;
    private crossoverTwoPoint;
    private crossoverUniform;
    private crossoverHalfUniform;
    private crossoverOrdered;
    crossover(bob: Chromosome<T>, method: CrossoverMethod | CustomCrossoverMethod<T>): Offspring<T>;
    setGenes(genes: T[]): void;
    getGenes(): Readonly<T>[];
    copy(bob: Chromosome<T>): void;
    clone(): Chromosome<T>;
}
