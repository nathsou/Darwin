import { Chromosome } from "./Chromosome";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
export interface DarwinParams<T> {
    populationSize: number;
    chromosomeLength: number;
    randGene: () => T;
    crossoverRate?: number;
    mutationRate?: number;
    crossoverMethod?: CrossoverMethod | CustomCrossoverMethod<T>;
    mutationMethod?: MutationMethod | CustomMutationMethod<T>;
    eliteCount?: number;
    eliteCopies?: number;
}
export interface DarwinStats<T> {
    fittest: Chromosome<T>;
    fittestIndex: number;
    averageFitness: number;
    totalFitness: number;
    needsUpdate: boolean;
}
export declare type FitnessEvaluator<T> = (chromo: Readonly<T>[]) => number;
export declare class Darwin<T> {
    private population;
    private stats;
    private generation;
    private params;
    constructor(params: DarwinParams<T>);
    private duplicateElite;
    private crossover;
    private mutate;
    /**
     * Updates the fitness of the entire population
     * by evaluating the fitness of each chromosome
     * using the given function
     */
    updateFitness(fitnessEvaluator: FitnessEvaluator<T>): void;
    /**
     * generates a new generation
     * the fitness of each Chromosome must be updated before calling mate
     * using setFitness or updateFitness
     */
    mate(): void;
    getPopulation(): Readonly<Array<Chromosome<T>>>;
    getChromosomeAt(index: number): Chromosome<T>;
    getRandomChromosome(): Chromosome<T>;
    getTopChromosomes(count: number): Readonly<Array<Chromosome<T>>>;
    getAverageFitness(): Readonly<number>;
    getFittest(): Chromosome<T>;
    getParams(): Readonly<DarwinParams<T>>;
    getGeneration(): Readonly<number>;
    getStats(): Readonly<DarwinStats<T>>;
    updateStats(forceUpdate?: boolean): void;
}
