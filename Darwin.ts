//Nathan Soufflet - 22/12/2016

enum CrossoverMethod {
    SINGLE_POINT,
    TWO_POINT,
    UNIFORM,
    HALF_UNIFORM
}

class NeuralNet { //minified version, only implements feedforwarding
    
    private weights_and_biases: number[] = [];
    private num_neurons_per_layer: number[];
    private offsets: number[]; //for optimization purposes

    constructor() {
        
    }

    public getWeight(l: number, j: number, k: number) : number {

        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1) + k + 1];
    }

    public getBias(l: number, j: number) : number {
        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1)]; 
    }

    public feedforward(inputs: number[]) : number[] {

        if (this.weights_and_biases.length === 0)
            throw new Error(`Cannot feedforward before 'putWeights' or 'fromJSON' was called.`);

        if (inputs.length !== this.num_neurons_per_layer[0])
            throw new Error(`Expected ${this.num_neurons_per_layer[0]} inputs, got ${inputs.length}.`);

        let a = inputs, output: number[];

        for (let l = 1; l < this.num_neurons_per_layer.length; l++) {
            output = [];
            for (let j = 0; j < this.num_neurons_per_layer[l]; j++) {
                let z = this.getBias(l, j);
                for (let k = 0; k < this.num_neurons_per_layer[l - 1]; k++)
                    z += this.getWeight(l, j, k) * a[k];
                output[j] = 1 / (1 + Math.exp(-z));
            }
            a = output;
        }



        return output;
    }

    public run(...inputs: number[]) : number[] { //alias to feedforward
        return this.feedforward(inputs);
    }

    private computeOffsets() : void {

        this.offsets = [0];

        let offset = 0;

        for (let l = 1; l < this.num_neurons_per_layer.length - 1; l++)
            this.offsets.push((offset += this.num_neurons_per_layer[l - 1] * (this.num_neurons_per_layer[l] + 1)));
    }

    public putWeights(num_neurons_per_layer: number[], weights_and_biases: number[]) : void {

        this.num_neurons_per_layer = num_neurons_per_layer;

        this.computeOffsets();

        let N = NeuralNet.weightsCount(num_neurons_per_layer);

        if (N !== weights_and_biases.length)
            throw new Error(`The number of weights do not match the given architecture, expected ${N}, got ${weights_and_biases.length}.`);

        this.weights_and_biases = weights_and_biases;
    }

    //returns the number of weights (biases included) for a given architecture
    static weightsCount(num_neurons_per_layer: number[]) : number {

        let count = 0;

        for (let l = 1; l < num_neurons_per_layer.length; l++) 
            count += num_neurons_per_layer[l] * (num_neurons_per_layer[l - 1] + 1);

        return count;
    }

    public toJSON() : Object {

        return {
            weights_and_biases: this.weights_and_biases,
            layers: this.num_neurons_per_layer
        }

    }

    public toFunction() : Function {
        return new Function('inputs', `
            var json = ${JSON.stringify(this.toJSON())};

            if (inputs.length !== json.layers[0])
                throw new Error('Expected ' + json.layers[0] + ' inputs, got ' + inputs.length + '.');

            var offsets = ${JSON.stringify(this.offsets)}, a = inputs, output;

            for (var l = 1; l < json.layers.length; l++) {
                output = [];
                for (var j = 0; j < json.layers[l]; j++) {
                    var z = json.weights_and_biases[offsets[l - 1] + j * (json.layers[l - 1] + 1)]; 
                    for (var k = 0; k < json.layers[l - 1]; k++)
                        z += json.weights_and_biases[offsets[l - 1] + j * (json.layers[l - 1] + 1) + k + 1] * a[k];
                    output[j] = 1 / (1 + Math.exp(-z));
                }
                a = output;
            }

            return output;
        `); 
    }

    static fromJSON(json: { weights_and_biases: number[], layers: number[] }) : NeuralNet {
        let NN = new NeuralNet();

        NN.putWeights(json.layers, json.weights_and_biases);

        return NN;
    }

    static fromWeights(num_neurons_per_layer: number[], weights_and_biases: number[]) : NeuralNet {
        let NN = new NeuralNet();
        NN.putWeights(num_neurons_per_layer, weights_and_biases);

        return NN;
    }

}

class Chromosome<T> {

    private bits: T[] = [];
    private fitness = 0;
    private locked = false; //prevent from changing

    constructor(private length: number, private randFunc: () => T) {

        for (let i = 0; i < length; i++)
            this.bits.push(randFunc());
    }

    public getFitness() : number {
        return this.fitness;
    }

    public setFitness(f: number) : void {
        this.fitness = f;
    }

    public compare(bob: Chromosome<T>) : number { //returns the number of bits which are different = Hamming distance

        let count = 0;

        for (let i = 0; i < Math.min(this.length, bob.length); i++)
            count += this.bits[i] !== bob.bits[i] ? 1 : 0;

            return count;
    }

    public mutate(randFunc: () => T, flipProbability = 1 / this.length) : void {

        if (this.locked) return;

        for (let i = 0; i < this.length; i++)
            if (Math.random() < flipProbability)
                this.bits[i] = randFunc();
    }

    public crossover(bob: Chromosome<T>, method: CrossoverMethod = CrossoverMethod.SINGLE_POINT) : {
        baby1: T[],
        baby2: T[]
    } {

        if (this.locked || bob.locked) return {
            baby1: this.bits,
            baby2: bob.bits
        };

        let b1: T[] = [],
            b2: T[] = [];

        switch(method) {
            case CrossoverMethod.SINGLE_POINT:

                let p = Math.floor(Math.random() * this.length);

                for (let i = 0; i < this.length; i++) {
                    b1.push(i < p ? this.bits[i] : bob.bits[i]);
                    b2.push(i < p ? bob.bits[i] : this.bits[i]);
                }

                break;

            case CrossoverMethod.TWO_POINT:

                let p1 = Math.floor(Math.random() * this.length),
                    p2 = Math.floor(Math.random() * this.length);

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

            let diff_bits: number[] = [];

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

    public lock() : void {
        this.locked = true;
    }

    public unlock() : void {
        this.locked = false;
    }

    public isLocked() : boolean {
        return this.locked;
    }

    public setBits(bits: T[]) : void {
        this.bits = bits.slice();
    }

    public getBits() : T[] {
        return this.bits.slice();
    }

    public copy(bob: Chromosome<T>) : void {
        this.bits = bob.bits.slice();
        this.randFunc = bob.randFunc;
        this.fitness = bob.fitness;
        //don't copy the lock
    }

    public clone() : Chromosome<T> {
        let c = new Chromosome<T>(this.length, this.randFunc);
        c.copy(this);
        return c;
    }

}


interface DarwinParams<T> {
    population_size: number,
    chromosome_length: number,
    rand_func: () => T,
    crossover_rate?: number,
    mutation_rate?: number,
    crossover_method?: CrossoverMethod,
    elite_count?: number,
    elite_copies?: number
}

class Darwin<T> {

    private population: Chromosome<T>[] = [];
    private fittest: Chromosome<T>;
    private avg_fitness: number = 0;
    public generation = 0;

    constructor(private params: DarwinParams<T>) {

        for (let i = 0; i < params.population_size; i++)
            this.population.push(new Chromosome<T>(params.chromosome_length, params.rand_func));

        //select an arbitrary chromosome to start with
        this.fittest = this.population[0];

        this.params.crossover_rate = this.params.crossover_rate || 0.7;
        this.params.mutation_rate = this.params.mutation_rate || 0.01;
        this.params.crossover_method = this.params.crossover_method || CrossoverMethod.SINGLE_POINT;
        this.params.elite_count = this.params.elite_count || 0;//Math.floor(this.params.population_size / 25);
        this.params.elite_copies = this.params.elite_copies || 1;
    }

    public mate() { //generates the new generation, fitness of each Chromosome must be updated before calling mate
    
        this.generation++;

        //From the fittest to the least
        let sorted = this.population.sort((a: Chromosome<T>, b: Chromosome<T>) => b.getFitness() - a.getFitness());

        let new_pop: Chromosome<T>[] = [];

        //compute the average fitness of the population
        this.avg_fitness = 0;
        for (let c of this.population) this.avg_fitness += c.getFitness();
        this.avg_fitness /= this.params.population_size;

        this.fittest = sorted[0];

        //ELITISM i.e. keeping the fittest Chromosomes

        //Keep the fittest Chromosomes
        for (let i = 0; i < this.params.elite_count; i++) new_pop.push(sorted[i]);

        //Duplicate the elite
        for (let i = 0; i < this.params.elite_count; i++) 
            for (let j = 0; j < this.params.elite_copies; j++) 
                new_pop.push(sorted[i].clone());
        
        //REPRODUCTION

        //Crossover and mutate
        while (new_pop.length < this.params.population_size) {
            if (Math.random() < this.params.crossover_rate) {
                let mum = this.getRandomChromosome(),
                    dad = this.getRandomChromosome();

                let babies = mum.crossover(dad);

                let baby1 = new Chromosome<T>(this.params.chromosome_length, this.params.rand_func),
                    baby2 = new Chromosome<T>(this.params.chromosome_length, this.params.rand_func);

                baby1.setBits(babies.baby1);
                baby2.setBits(babies.baby2);
                
                new_pop.push(baby1, baby2);
            }
        }

        //Because we add two chromosomes per loop
        if (new_pop.length > this.params.population_size) new_pop.pop();

        //mutate
        for (let c of new_pop) {
            c.mutate(this.params.rand_func, this.params.mutation_rate);
            c.setFitness(0); //reset fitness
        }

        //uptate the population
        this.population = new_pop;
    }

    //Getters & Setters

    public getPopulation() : Chromosome<T>[] {
        return this.population;
    }

    public getRandomChromosome() : Chromosome<T> { //probability of being selected proportional to fitness

        //compute the sum of fitness
        let sumFitness = this.avg_fitness * this.params.population_size;

        if (sumFitness === 0) return this.population[Math.floor(Math.random() * this.population.length)];

        let r = Math.random() * sumFitness;

        let acc_fitness = 0;

        for (let i = 0; i < this.population.length; i++) {
            acc_fitness += this.population[i].getFitness();

            if (acc_fitness > r) return this.population[i];
        }
    }

    public getAverageFitness() : number {
        return this.avg_fitness;
    }

    public getFittest() : Chromosome<T> {
        return this.fittest;
    }

    public updateStats() : void {
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