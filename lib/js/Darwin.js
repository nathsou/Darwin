"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Chromosome_1 = require("./Chromosome");
const CrossoverMethods_1 = require("./CrossoverMethods");
const MutationMethod_1 = require("./MutationMethod");
const Utils_1 = require("./Utils");
class Darwin {
    constructor(params) {
        this.population = [];
        this.generation = 0;
        const on_fitness_update = () => { this.stats.needs_update = true; };
        for (let i = 0; i < params.population_size; i++) {
            const chromo = new Chromosome_1.Chromosome(params.chromosome_length, params.rand_gene);
            chromo.on('update_fitness', on_fitness_update);
            this.population.push(chromo);
        }
        this.params = Object.assign({ crossover_rate: 0.7, mutation_rate: 1 / params.population_size, crossover_method: CrossoverMethods_1.CrossoverMethod.SINGLE_POINT, mutation_method: MutationMethod_1.MutationMethod.FLIP, elite_count: Math.ceil(params.population_size / 25), elite_copies: 1 }, params);
        this.stats = {
            fittest: this.population[0],
            avg_fitness: 0,
            sum_fitness: 0,
            fittest_idx: 0,
            needs_update: true
        };
    }
    duplicateElite(new_pop) {
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
    crossover(new_pop) {
        const { population_size, crossover_rate, crossover_method, rand_gene } = this.params;
        while (new_pop.length < population_size) {
            if (Math.random() < crossover_rate) {
                const mum = this.getRandomChromosome();
                const dad = this.getRandomChromosome();
                const { baby1, baby2 } = mum.crossover(dad, crossover_method);
                new_pop.push(new Chromosome_1.Chromosome(baby1, rand_gene), new Chromosome_1.Chromosome(baby2, rand_gene));
            }
        }
        // Because we add two chromosomes per loop
        // if population_size is odd
        if (this.params.population_size % 2 === 1) {
            new_pop.pop();
        }
    }
    mutate(new_pop) {
        for (const c of new_pop) {
            c.mutate(this.params.mutation_rate, this.params.mutation_method);
            // c.setFitness(0); // reset fitness
        }
    }
    updateFitness(fitness_evaluator) {
        for (const chromo of this.population) {
            chromo.setFitness(fitness_evaluator(chromo.getGenes()));
        }
        this.stats.needs_update = true;
    }
    // generates the new generation
    // the fitness of each Chromosome must be updated before calling mate
    mate() {
        const new_pop = [];
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
    getPopulation() {
        return this.population;
    }
    getChromosome(idx) {
        return this.population[idx];
    }
    getRandomChromosome() {
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
    getTopChromosomes(count) {
        // return this.population.sort((a, b) => b.getFitness() - a.getFitness()).slice(0, count);
        return Utils_1.selectKBest(this.population, count);
    }
    getAverageFitness() {
        this.updateStats();
        return this.stats.avg_fitness;
    }
    getFittest() {
        this.updateStats();
        return this.stats.fittest;
    }
    getParams() {
        return this.params;
    }
    getGeneration() {
        return this.generation;
    }
    getStats() {
        return this.stats;
    }
    updateStats(force_update = false) {
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
exports.Darwin = Darwin;
