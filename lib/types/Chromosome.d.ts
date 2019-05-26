import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import EventEmitter from "./EventEmitter";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
export interface Offspring<T> {
    baby1: T[];
    baby2: T[];
}
export declare class Chromosome<T> extends EventEmitter<'update_fitness'> {
    private length;
    private genes;
    private fitness;
    private rand_gene;
    constructor(length: number, rand_gene: () => T);
    constructor(genes: T[], rand_gene: () => T);
    getFitness(): number;
    setFitness(f: number): void;
    compare(bob: Chromosome<T>): number;
    private mutate_flip;
    private mutate_swap;
    mutate(mut_rate: number, method: MutationMethod | CustomMutationMethod<T>): void;
    private crossover_single_point;
    private crossover_two_point;
    private crossover_uniform;
    private crossover_half_uniform;
    private crossover_ordered;
    crossover(bob: Chromosome<T>, method: CrossoverMethod | CustomCrossoverMethod<T>): Offspring<T>;
    setGenes(genes: T[]): void;
    getGenes(): Readonly<T>[];
    copy(bob: Chromosome<T>): void;
    clone(): Chromosome<T>;
}
