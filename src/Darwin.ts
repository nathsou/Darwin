import { Chromosome } from "./Chromosome";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
import { selectKBest } from "./Utils";

export interface DarwinParams<T> {
    populationSize: number,
    chromosomeLength: number,
    randGene: () => T,
    crossoverRate?: number,
    mutationRate?: number,
    crossoverMethod?: CrossoverMethod | CustomCrossoverMethod<T>,
    mutationMethod?: MutationMethod | CustomMutationMethod<T>,
    eliteCount?: number,
    eliteCopies?: number
}

export interface DarwinStats<T> {
    fittest: Chromosome<T>,
    fittestIndex: number,
    averageFitness: number,
    totalFitness: number,
    needsUpdate: boolean
}

export type FitnessEvaluator<T> = (chromo: Readonly<T>[]) => number;

export class Darwin<T> {
    private population: Array<Chromosome<T>> = [];
    private stats: DarwinStats<T>;
    private generation = 0;
    private params: Required<DarwinParams<T>>;

    constructor(params: DarwinParams<T>) {
        const onFitnessUpdate = () => { this.stats.needsUpdate = true; };

        for (let i = 0; i < params.populationSize; i++) {
            const chromo = Chromosome.generate(params.chromosomeLength, params.randGene);
            chromo.on('update_fitness', onFitnessUpdate);
            this.population.push(chromo);
        }

        this.params = {
            crossoverRate: 0.7,
            mutationRate: 1 / params.populationSize,
            crossoverMethod: CrossoverMethod.SINGLE_POINT,
            mutationMethod: MutationMethod.FLIP,
            eliteCount: Math.ceil(params.populationSize / 25),
            eliteCopies: 1,
            ...params
        };

        this.stats = {
            fittest: this.population[0],
            averageFitness: 0,
            totalFitness: 0,
            fittestIndex: 0,
            needsUpdate: true
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
        const { populationSize, crossoverRate, crossoverMethod, randGene } = this.params;

        while (newPopulation.length < populationSize) {
            if (Math.random() < crossoverRate) {
                const mum = this.getRandomChromosome();
                const dad = this.getRandomChromosome();

                const [baby1, baby2] = mum.crossover(dad, crossoverMethod);

                newPopulation.push(
                    new Chromosome<T>(baby1, randGene),
                    new Chromosome<T>(baby2, randGene)
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
            c.mutate(this.params.mutationRate, this.params.mutationMethod);
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

        this.stats.needsUpdate = true;
    }

    /**
     * generates a new generation
     * the fitness of each Chromosome must be updated before calling mate
     * using setFitness or updateFitness
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
        this.updateStats(true);
    }

    // Getters & Setters
    public getPopulation(): Readonly<Array<Chromosome<T>>> {
        return this.population;
    }

    public getChromosomeAt(index: number): Chromosome<T> {
        return this.population[index];
    }

    // probability of being selected proportional to fitness
    public getRandomChromosome(): Chromosome<T> {
        this.updateStats();

        if (this.stats.totalFitness === 0) {
            return this.population[Math.floor(Math.random() * this.population.length)];
        }

        const r = Math.random() * this.stats.totalFitness;

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

    public getTopChromosomes(count: number): Readonly<Array<Chromosome<T>>> {
        return selectKBest(this.population, count);
    }

    public getAverageFitness(): Readonly<number> {
        this.updateStats();
        return this.stats.averageFitness;
    }

    public getFittest(): Chromosome<T> {
        this.updateStats();
        return this.stats.fittest;
    }

    public getParams(): Readonly<DarwinParams<T>> {
        return this.params;
    }

    public getGeneration(): Readonly<number> {
        return this.generation;
    }

    public getStats(): Readonly<DarwinStats<T>> {
        return this.stats;
    }

    public updateStats(forceUpdate = false): void {
        if (forceUpdate || this.stats.needsUpdate) {
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
            this.stats.needsUpdate = false;
        }
    }
}