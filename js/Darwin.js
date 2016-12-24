//Nathan Soufflet - 22/12/2016
var CrossoverMethod;
(function (CrossoverMethod) {
    CrossoverMethod[CrossoverMethod["SINGLE_POINT"] = 0] = "SINGLE_POINT";
    CrossoverMethod[CrossoverMethod["TWO_POINT"] = 1] = "TWO_POINT";
    CrossoverMethod[CrossoverMethod["UNIFORM"] = 2] = "UNIFORM";
    CrossoverMethod[CrossoverMethod["HALF_UNIFORM"] = 3] = "HALF_UNIFORM";
})(CrossoverMethod || (CrossoverMethod = {}));
class NeuralNet {
    constructor() {
        this.weights = [];
        this.biases = [];
    }
    feedforward(inputs) {
        if (this.weights.length === 0 || this.biases.length === 0)
            throw new Error(`Cannot feedforward before 'putWeights' was called.`);
        if (inputs.length !== this.num_neurons_per_layer[0])
            throw new Error(`Expected ${this.num_neurons_per_layer[0]} inputs, got ${inputs.length}.`);
        let a = inputs, output;
        for (let l = 1; l < this.num_neurons_per_layer.length; l++) {
            output = [];
            for (let j = 0; j < this.num_neurons_per_layer[l]; j++) {
                let z = this.biases[l][j];
                for (let k = 0; k < this.num_neurons_per_layer[l - 1]; k++)
                    z += this.weights[l][j][k] * a[k];
                output[j] = 1 / (1 + Math.exp(-z));
            }
            a = output;
        }
        return output;
    }
    run(...inputs) {
        return this.feedforward(inputs);
    }
    putWeights(num_neurons_per_layer, weights_and_biases) {
        this.num_neurons_per_layer = num_neurons_per_layer;
        let N = NeuralNet.weightsCount(num_neurons_per_layer);
        if (N !== weights_and_biases.length)
            throw new Error(`The number of weights do not match the given architecture, expected ${N}, got ${weights_and_biases.length}.`);
        let c = 0;
        this.weights = [];
        this.biases = [];
        for (let l = 1; l < num_neurons_per_layer.length; l++) {
            this.weights[l] = [];
            this.biases[l] = [];
            for (let j = 0; j < num_neurons_per_layer[l]; j++) {
                this.biases[l][j] = weights_and_biases[c++];
                this.weights[l][j] = weights_and_biases.slice(c, c += num_neurons_per_layer[l - 1]);
            }
        }
    }
    //returns the number of weights (biases included) for a given architecture
    static weightsCount(num_neurons_per_layer) {
        let count = 0;
        for (let l = 1; l < num_neurons_per_layer.length; l++)
            count += (num_neurons_per_layer[l] + 1) * num_neurons_per_layer[l - 1];
        return count;
    }
}
class Chromosome {
    constructor(length, randFunc) {
        this.length = length;
        this.randFunc = randFunc;
        this.bits = [];
        this.fitness = 0;
        this.locked = false; //prevent from changing
        for (let i = 0; i < length; i++)
            this.bits.push(randFunc());
    }
    getFitness() {
        return this.fitness;
    }
    setFitness(f) {
        this.fitness = f;
    }
    compare(bob) {
        let count = 0;
        for (let i = 0; i < Math.min(this.length, bob.length); i++)
            count += this.bits[i] !== bob.bits[i] ? 1 : 0;
        return count;
    }
    mutate(randFunc, flipProbability = 1 / this.length) {
        if (this.locked)
            return;
        for (let i = 0; i < this.length; i++)
            if (Math.random() < flipProbability)
                this.bits[i] = randFunc();
    }
    crossover(bob, method = CrossoverMethod.SINGLE_POINT) {
        if (this.locked || bob.locked)
            return {
                baby1: this.bits,
                baby2: bob.bits
            };
        let b1 = [], b2 = [];
        switch (method) {
            case CrossoverMethod.SINGLE_POINT:
                let p = Math.floor(Math.random() * this.length);
                for (let i = 0; i < this.length; i++) {
                    b1.push(i < p ? this.bits[i] : bob.bits[i]);
                    b2.push(i < p ? bob.bits[i] : this.bits[i]);
                }
                break;
            case CrossoverMethod.TWO_POINT:
                let p1 = Math.floor(Math.random() * this.length), p2 = Math.floor(Math.random() * this.length);
                if (p1 > p2) {
                    let c = p2;
                    p2 = p1;
                    p1 = c;
                }
                for (let i = 0; i < this.length; i++) {
                    b1.push(i < p1 ? this.bits[i] : (i < p2 ? bob.bits[i] : this.bits[i]));
                    b2.push(i < p1 ? bob.bits[i] : (i < p2 ? this.bits[i] : bob.bits[i]));
                }
                break;
            case CrossoverMethod.UNIFORM:
                for (let i = 0; i < this.length; i++) {
                    let swap = Math.random() < 0.5;
                    b1.push(swap ? bob.bits[i] : this.bits[i]);
                    b2.push(swap ? this.bits[i] : bob.bits[i]);
                }
                break;
            case CrossoverMethod.HALF_UNIFORM:
                let diff_bits = [];
                for (let i = 0; i < this.length; i++)
                    if (this.bits[i] !== bob.bits[i])
                        diff_bits.push(i);
                let N = diff_bits.length;
                b1 = this.bits.slice();
                b2 = bob.bits.slice();
                for (let i = 0; i < N / 2; i++) {
                    let idx = Math.floor(Math.random() * diff_bits.length);
                    b1[diff_bits[idx]] = bob.bits[diff_bits[idx]];
                    b2[diff_bits[idx]] = this.bits[diff_bits[idx]];
                    diff_bits.splice(idx, 1);
                }
        }
        return {
            baby1: b1,
            baby2: b2
        };
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
    isLocked() {
        return this.locked;
    }
    setBits(bits) {
        this.bits = bits.slice();
    }
    getBits() {
        return this.bits.slice();
    }
    copy(bob) {
        this.bits = bob.bits.slice();
        this.randFunc = bob.randFunc;
        this.fitness = bob.fitness;
        //don't copy the lock
    }
    clone() {
        let c = new Chromosome(this.length, this.randFunc);
        c.copy(this);
        return c;
    }
}
class Darwin {
    constructor(params) {
        this.params = params;
        this.population = [];
        this.avg_fitness = 0;
        this.generation = 0;
        for (let i = 0; i < params.population_size; i++)
            this.population.push(new Chromosome(params.chromosome_length, params.rand_func));
        //select an arbitrary chromosome to start with
        this.fittest = this.population[0];
        this.params.crossover_rate = this.params.crossover_rate || 0.7;
        this.params.mutation_rate = this.params.mutation_rate || 0.01;
        this.params.crossover_method = this.params.crossover_method || CrossoverMethod.SINGLE_POINT;
        this.params.elite_count = this.params.elite_count || 0; //Math.floor(this.params.population_size / 25);
        this.params.elite_copies = this.params.elite_copies || 1;
    }
    mate() {
        this.generation++;
        //From the fittest to the least
        let sorted = this.population.sort((a, b) => b.getFitness() - a.getFitness());
        let new_pop = [];
        //compute the average fitness of the population
        this.avg_fitness = 0;
        for (let c of this.population)
            this.avg_fitness += c.getFitness();
        this.avg_fitness /= this.params.population_size;
        this.fittest = sorted[0];
        //ELITISM
        //Keep the fittest Chromosomes
        for (let i = 0; i < this.params.elite_count; i++)
            new_pop.push(sorted[i]);
        //Copy the elite
        for (let i = 0; i < this.params.elite_count; i++)
            for (let j = 0; j < this.params.elite_copies; j++)
                new_pop.push(sorted[i].clone());
        //REPRODUCTION
        //Crossover and mutate
        while (new_pop.length < this.params.population_size) {
            if (Math.random() < this.params.crossover_rate) {
                let mum = this.getRandomChromosome(), dad = this.getRandomChromosome();
                let babies = mum.crossover(dad);
                let baby1 = new Chromosome(this.params.chromosome_length, this.params.rand_func), baby2 = new Chromosome(this.params.chromosome_length, this.params.rand_func);
                baby1.setBits(babies.baby1);
                baby2.setBits(babies.baby2);
                new_pop.push(baby1, baby2);
            }
        }
        //Because we add two chromosomes per loop
        if (new_pop.length > this.params.population_size)
            new_pop.pop();
        //mutate
        for (let c of new_pop) {
            c.mutate(this.params.rand_func, this.params.mutation_rate);
            c.setFitness(0); //reset fitness
        }
        //uptate the population
        this.population = new_pop;
    }
    //Getters & Setters
    getPopulation() {
        return this.population;
    }
    getRandomChromosome() {
        //compute the sum of fitness
        let sumFitness = this.avg_fitness * this.params.population_size;
        if (sumFitness === 0)
            return this.population[Math.floor(Math.random() * this.population.length)];
        let r = Math.random() * sumFitness;
        let acc_fitness = 0;
        for (let i = 0; i < this.population.length; i++) {
            acc_fitness += this.population[i].getFitness();
            if (acc_fitness > r)
                return this.population[i];
        }
    }
    getAverageFitness() {
        return this.avg_fitness;
    }
    getFittest() {
        return this.fittest;
    }
    updateStats() {
        //compute the average fitness of the population
        this.avg_fitness = 0;
        let max_fitness = 0, fittest_idx = 0, i = 0;
        for (let c of this.population) {
            this.avg_fitness += c.getFitness();
            if (c.getFitness() > max_fitness) {
                max_fitness = c.getFitness();
                fittest_idx = i;
            }
            i++;
        }
        this.avg_fitness /= this.params.population_size;
        this.fittest = this.population[fittest_idx];
    }
}
