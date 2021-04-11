import { Chromosome } from "./Chromosome";
import { crossoverMethod, CrossoverFunction } from "./CrossoverMethods";
import { MutationFunction, mutationMethod } from "./MutationMethod";
import { selectKBest } from "./Utils";

export interface DarwinParams<T> {
    populationSize: number,
    chromosomeLength: number,
    randomGene: () => T,
    crossoverRate?: number,
    mutationRate?: number,
    crossoverMethod?: CrossoverFunction<T>,
    mutationMethod?: MutationFunction<T>,
    eliteCount?: number,
    eliteCopies?: number,
    randomNumber?: () => number // a random number between 0 and 1
}

export interface DarwinStats<T> {
    fittest: Chromosome<T>,
    fittestIndex: number,
    averageFitness: number,
    totalFitness: number
}

/**
 * a function to evaluate the fitness of a given chromosome
 */
export type FitnessEvaluator<T> = (chromo: Readonly<T>[]) => number;

export class Darwin<T> {
    private population: Array<Chromosome<T>> = [];
    private stats: DarwinStats<T>;
    private statsNeedUpdate = true;
    private generation = 0;
    private params: Required<DarwinParams<T>>;

    constructor(params: DarwinParams<T>) {
        this.params = {
            crossoverRate: 0.7,
            mutationRate: 1 / params.populationSize,
            crossoverMethod: crossoverMethod.singlePoint,
            mutationMethod: mutationMethod.flip,
            eliteCount: Math.ceil(params.populationSize / 25),
            eliteCopies: 1,
            randomNumber: Math.random,
            ...params
        };

        for (let i = 0; i < params.populationSize; i++) {
            const chromo = Chromosome.generate(
                this.params.chromosomeLength,
                this.params.randomGene,
                this.params.randomNumber
            );

            this.population.push(chromo);
        }

        this.stats = {
            fittest: this.population[0],
            averageFitness: 0,
            totalFitness: 0,
            fittestIndex: 0
        };
    }

    private duplicateElite(newPopulation: Array<Chromosome<T>>): void {
        // ELITISM i.e. keeping the fittest Chromosomes

        const { eliteCount, eliteCopies } = this.params;

        if (eliteCount > 0) {
            const elite = this.getTopChromosomes(eliteCount);
            // Keep the fittest Chromosomes
            newPopulation.push(...elite);

            // Duplicate the elite
            for (let i = 0; i < eliteCount; i++) {
                for (let j = 0; j < eliteCopies; j++) {
                    newPopulation.push(elite[i].clone());
                }
            }
        }
    }

    private crossover(newPopulation: Array<Chromosome<T>>): void {
        const {
            populationSize, crossoverRate, crossoverMethod,
            randomGene, randomNumber
        } = this.params;

        while (newPopulation.length < populationSize) {
            if (this.params.randomNumber() < crossoverRate) {
                const mum = this.getRandomChromosome();
                const dad = this.getRandomChromosome();

                const [baby1, baby2] = mum.crossoverWith(dad, crossoverMethod);

                newPopulation.push(
                    new Chromosome<T>(baby1, randomGene, randomNumber),
                    new Chromosome<T>(baby2, randomGene, randomNumber)
                );
            }
        }

        // Because we add two chromosomes per loop
        // if population_size is odd
        if (this.params.populationSize % 2 === 1) {
            newPopulation.pop();
        }
    }

    private mutate(newPopulation: Array<Chromosome<T>>): void {
        for (const c of newPopulation) {
            c.mutateWith(this.params.mutationRate, this.params.mutationMethod);
            // c.setFitness(0); // reset fitness
        }
    }

    /**
     * Updates the fitness of the entire population
     * by evaluating the fitness of each chromosome
     * using the given function 
     */
    public updateFitness(fitnessEvaluator: FitnessEvaluator<T>): void {
        for (let i = 0; i < this.population.length; i++) {
            const chromo = this.population[i];
            chromo.setFitness(fitnessEvaluator(chromo.getGenes()));
        }
    }

    /**
     * generates a new generation
     * the fitness of each chromosome must be updated before calling this function
     * using `setFitness` on each chromosome or `updateFitness`
     */
    public mate(): void {
        const newPopulation: Array<Chromosome<T>> = [];

        // ELITISM
        this.duplicateElite(newPopulation);

        // REPRODUCTION
        this.crossover(newPopulation);
        this.mutate(newPopulation);

        // uptate the population
        this.population = newPopulation;
        this.generation += 1;
        this.statsNeedUpdate = true;
    }

    /**
     * @returns the entire population
     */
    public getPopulation(): Readonly<Array<Chromosome<T>>> {
        return this.population;
    }

    /**
     * @returns the chromosome at index `index`
     */
    public getChromosomeAt(index: number): Chromosome<T> {
        return this.population[index];
    }

    /**
     * @returns a random chromosome from the population
     * where the probability of being selected is proportional to the fitness
     */
    public getRandomChromosome(): Chromosome<T> {
        this.updateStats();

        if (this.stats.totalFitness === 0) {
            return this.population[Math.floor(this.params.randomNumber() * this.population.length)];
        }

        const r = this.params.randomNumber() * this.stats.totalFitness;

        let accumulatedFitness = 0;

        for (let i = 0; i < this.population.length; i++) {
            accumulatedFitness += this.population[i].getFitness();

            if (accumulatedFitness > r) {
                return this.population[i];
            }
        }

        // this should never happen
        return this.population[0];
    }

    /**
     * efficiently computes the `count` best chromosomes
     * in the population based on their fitness
     */
    public getTopChromosomes(count: number): Readonly<Array<Chromosome<T>>> {
        return selectKBest(this.population, count);
    }

    /**
     * @returns the parameters used to construct this Darwin instance
     */
    public getParams(): Readonly<DarwinParams<T>> {
        return this.params;
    }

    /**
     * @returns the current generation
     */
    public getGeneration(): Readonly<number> {
        return this.generation;
    }

    /**
     * returns the latest statistics,
     * to compute an updated version call `updateStats`
     */
    public getStats(): Readonly<DarwinStats<T>> {
        return this.stats;
    }

    /**
     * update the statistics for this generation
     * if forceUpdate is true, update even if `mate`
     * has not been called
     */
    public updateStats(forceUpdate = false): Readonly<DarwinStats<T>> {
        if (forceUpdate || this.statsNeedUpdate) {
            let totalFitness = 0;
            let maxFitness = 0;
            let fittestIndex = 0;

            for (let i = 0; i < this.population.length; i++) {
                const fitness = this.population[i].getFitness();
                totalFitness += fitness;

                if (fitness > maxFitness) {
                    maxFitness = fitness;
                    fittestIndex = i;
                }
            }

            this.stats.totalFitness = totalFitness;
            this.stats.averageFitness = totalFitness / this.params.populationSize;
            this.stats.fittest = this.population[fittestIndex].clone();
            this.stats.fittestIndex = fittestIndex;
            this.statsNeedUpdate = false;
        }

        return this.stats;
    }
}