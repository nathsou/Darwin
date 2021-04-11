"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Darwin = void 0;
const Chromosome_1 = require("./Chromosome");
const CrossoverMethods_1 = require("./CrossoverMethods");
const MutationMethod_1 = require("./MutationMethod");
const Utils_1 = require("./Utils");
class Darwin {
    constructor(params) {
        this.population = [];
        this.generation = 0;
        const onFitnessUpdate = () => { this.stats.needsUpdate = true; };
        for (let i = 0; i < params.populationSize; i++) {
            const chromo = Chromosome_1.Chromosome.generate(params.chromosomeLength, params.randGene);
            chromo.on('update_fitness', onFitnessUpdate);
            this.population.push(chromo);
        }
        this.params = Object.assign({ crossoverRate: 0.7, mutationRate: 1 / params.populationSize, crossoverMethod: CrossoverMethods_1.CrossoverMethod.SINGLE_POINT, mutationMethod: MutationMethod_1.MutationMethod.FLIP, eliteCount: Math.ceil(params.populationSize / 25), eliteCopies: 1 }, params);
        this.stats = {
            fittest: this.population[0],
            averageFitness: 0,
            totalFitness: 0,
            fittestIndex: 0,
            needsUpdate: true
        };
    }
    duplicateElite(newPopulation) {
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
    crossover(newPopulation) {
        const { populationSize, crossoverRate, crossoverMethod, randGene } = this.params;
        while (newPopulation.length < populationSize) {
            if (Math.random() < crossoverRate) {
                const mum = this.getRandomChromosome();
                const dad = this.getRandomChromosome();
                const [baby1, baby2] = mum.crossover(dad, crossoverMethod);
                newPopulation.push(new Chromosome_1.Chromosome(baby1, randGene), new Chromosome_1.Chromosome(baby2, randGene));
            }
        }
        // Because we add two chromosomes per loop
        // if population_size is odd
        if (this.params.populationSize % 2 === 1) {
            newPopulation.pop();
        }
    }
    mutate(newPopulation) {
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
    updateFitness(fitnessEvaluator) {
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
    mate() {
        const newPopulation = [];
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
    getPopulation() {
        return this.population;
    }
    getChromosomeAt(index) {
        return this.population[index];
    }
    // probability of being selected proportional to fitness
    getRandomChromosome() {
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
    getTopChromosomes(count) {
        return Utils_1.selectKBest(this.population, count);
    }
    getAverageFitness() {
        this.updateStats();
        return this.stats.averageFitness;
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
    updateStats(forceUpdate = false) {
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
exports.Darwin = Darwin;
