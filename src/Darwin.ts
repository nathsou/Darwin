import { Chromosome } from "./Chromosome";
import { CrossoverMethod, CustomCrossoverMethod } from "./CrossoverMethods";
import { CustomMutationMethod, MutationMethod } from "./MutationMethod";
import { selectKBest } from "./Utils";

export interface DarwinParams<T> {
    population_size: number,
    chromosome_length: number,
    rand_gene: () => T,
    crossover_rate?: number,
    mutation_rate?: number,
    crossover_method?: CrossoverMethod | CustomCrossoverMethod<T>,
    mutation_method?: MutationMethod | CustomMutationMethod<T>,
    elite_count?: number,
    elite_copies?: number
}

export interface DarwinStats<T> {
    fittest: Chromosome<T>,
    fittest_idx: number,
    avg_fitness: number,
    sum_fitness: number,
    needs_update: boolean
}

export type FitnessEvaluator<T> = (chromo: Readonly<T>[]) => number;

export class Darwin<T> {

    private population: Chromosome<T>[] = [];
    private stats: DarwinStats<T>;
    private generation = 0;
    private params: Required<DarwinParams<T>>;

    constructor(params: DarwinParams<T>) {

        const on_fitness_update = () => { this.stats.needs_update = true; };

        for (let i = 0; i < params.population_size; i++) {
            const chromo = new Chromosome<T>(params.chromosome_length, params.rand_gene);
            chromo.on('update_fitness', on_fitness_update);
            this.population.push(chromo);
        }

        this.params = {
            crossover_rate: 0.7,
            mutation_rate: 1 / params.population_size,
            crossover_method: CrossoverMethod.SINGLE_POINT,
            mutation_method: MutationMethod.FLIP,
            elite_count: Math.ceil(params.population_size / 25),
            elite_copies: 1,
            ...params
        };

        this.stats = {
            fittest: this.population[0],
            avg_fitness: 0,
            sum_fitness: 0,
            fittest_idx: 0,
            needs_update: true
        };

    }

    private duplicateElite(new_pop: Chromosome<T>[]): void {
        // ELITISM i.e. keeping the fittest Chromosomes

        const { elite_count, elite_copies } = this.params;

        if (elite_count > 0) {
            const elite = this.getTopChromosomes(elite_count);
            // Keep the fittest Chromosomes
            new_pop.push(...elite);

            // Duplicate the elite
            for (let i = 0; i < elite_count; i++) {
                for (let j = 0; j < elite_copies; j++) {
                    new_pop.push(elite[i].clone());
                }
            }
        }
    }

    private crossover(new_pop: Chromosome<T>[]): void {

        const { population_size, crossover_rate, crossover_method, rand_gene } = this.params;

        while (new_pop.length < population_size) {
            if (Math.random() < crossover_rate) {
                const mum = this.getRandomChromosome();
                const dad = this.getRandomChromosome();

                const { baby1, baby2 } = mum.crossover(dad, crossover_method);

                new_pop.push(
                    new Chromosome<T>(baby1, rand_gene),
                    new Chromosome<T>(baby2, rand_gene)
                );
            }
        }

        // Because we add two chromosomes per loop
        // if population_size is odd
        if (this.params.population_size % 2 === 1) {
            new_pop.pop();
        }
    }

    private mutate(new_pop: Chromosome<T>[]): void {
        for (const c of new_pop) {
            c.mutate(this.params.mutation_rate, this.params.mutation_method);
            // c.setFitness(0); // reset fitness
        }
    }

    public updateFitness(fitness_evaluator: FitnessEvaluator<T>): void {
        for (const chromo of this.population) {
            chromo.setFitness(fitness_evaluator(chromo.getGenes()));
        }

        this.stats.needs_update = true;
    }

    // generates the new generation
    // the fitness of each Chromosome must be updated before calling mate
    public mate(): void {

        const new_pop: Chromosome<T>[] = [];

        // ELITISM
        this.duplicateElite(new_pop);

        // REPRODUCTION
        this.crossover(new_pop);
        this.mutate(new_pop);

        // uptate the population
        this.population = new_pop;
        this.generation++;
        this.updateStats(true);
    }

    // Getters & Setters

    public getPopulation(): Chromosome<T>[] {
        return this.population;
    }

    public getChromosome(idx: number): Chromosome<T> {
        return this.population[idx];
    }

    public getRandomChromosome(): Chromosome<T> { // probability of being selected proportional to fitness
        this.updateStats();

        if (this.stats.sum_fitness === 0) {
            return this.population[Math.floor(Math.random() * this.population.length)];
        }

        const r = Math.random() * this.stats.sum_fitness;

        let acc_fitness = 0;

        for (let i = 0; i < this.population.length; i++) {
            acc_fitness += this.population[i].getFitness();

            if (acc_fitness > r) {
                return this.population[i];
            }
        }

        // this should never happen
        return this.population[0];
    }

    public getTopChromosomes(count: number): Chromosome<T>[] {
        // return this.population.sort((a, b) => b.getFitness() - a.getFitness()).slice(0, count);
        return selectKBest(this.population, count);
    }

    public getAverageFitness(): Readonly<number> {
        this.updateStats();
        return this.stats.avg_fitness;
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

    public updateStats(force_update = false): void {
        if (force_update || this.stats.needs_update) {

            let sum_fitness = 0;
            let max_fitness = 0;
            let fittest_idx = 0;

            for (let i = 0; i < this.population.length; i++) {
                const fitness = this.population[i].getFitness();
                sum_fitness += fitness;

                if (fitness > max_fitness) {
                    max_fitness = fitness;
                    fittest_idx = i;
                }
            }

            this.stats.sum_fitness = sum_fitness;
            this.stats.avg_fitness = sum_fitness / this.params.population_size;
            this.stats.fittest = this.population[fittest_idx].clone();
            this.stats.fittest_idx = fittest_idx;
            this.stats.needs_update = false;
        }
    }

}