import { MutationMethod, CustomMutationMethod } from "./MutationMethod";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { EventEmitter } from "./EventEmitter";
export interface Offspring<T> {
    baby1: T[];
    baby2: T[];
}
export declare class Chromosome<T> extends EventEmitter {
    private length;
    private bits;
    private fitness;
    private rand_func;
    constructor(length_or_bits: number | T[], rand_func: () => T);
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
    setBits(bits: T[]): void;
    getBits(): Readonly<T[]>;
    copy(bob: Chromosome<T>): void;
    clone(): Chromosome<T>;
}
