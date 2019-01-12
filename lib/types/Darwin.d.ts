import { Chromosome } from "./Chromosome";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
export interface DarwinParams<T> {
    population_size: number;
    chromosome_length: number;
    rand_func: () => T;
    crossover_rate?: number;
    mutation_rate?: number;
    crossover_method?: CrossoverMethod | CustomCrossoverMethod<T>;
    mutation_method?: MutationMethod | CustomMutationMethod<T>;
    elite_count?: number;
    elite_copies?: number;
}
export interface DarwinStats<T> {
    fittest: Chromosome<T>;
    fittest_idx: number;
    avg_fitness: number;
    sum_fitness: number;
    needs_update: boolean;
}
export declare type FitnessEvaluator<T> = (chromo: T[]) => number;
export declare class Darwin<T> {
    private population;
    private stats;
    private generation;
    private params;
    constructor(params: DarwinParams<T>);
    duplicateElite(new_pop: Chromosome<T>[]): void;
    crossover(new_pop: Chromosome<T>[]): void;
    mutate(new_pop: Chromosome<T>[]): void;
    updateFitness(fitness_evaluator: FitnessEvaluator<T>): void;
    mate(): void;
    getPopulation(): Chromosome<T>[];
    getChromosome(idx: number): Chromosome<T>;
    getRandomChromosome(): Chromosome<T>;
    getTopChromosomes(count: number): Chromosome<T>[];
    getAverageFitness(): Readonly<number>;
    getFittest(): Chromosome<T>;
    getParams(): Readonly<DarwinParams<T>>;
    getGeneration(): Readonly<number>;
    getStats(): Readonly<DarwinStats<T>>;
    updateStats(force_update?: boolean): void;
}
