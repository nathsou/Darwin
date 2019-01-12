export interface NeuralNetFunction {
    args: string[],
    body: string
}

export class NeuralNet { //minified version, only implements feedforwarding

    private weights_and_biases: number[] = [];
    private num_neurons_per_layer: number[];
    private offsets: number[]; //for optimization purposes

    constructor() { }

    public getWeight(l: number, j: number, k: number): number {

        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1) + k + 1];
    }

    public getBias(l: number, j: number): number {
        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1)];
    }

    public feedforward(inputs: number[]): number[] {

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

    public run(...inputs: number[]): number[] { //alias to feedforward
        return this.feedforward(inputs);
    }

    private computeOffsets(): void {

        this.offsets = [0];

        let offset = 0;

        for (let l = 1; l < this.num_neurons_per_layer.length - 1; l++) {
            this.offsets.push(
                (offset += this.num_neurons_per_layer[l - 1] * (this.num_neurons_per_layer[l] + 1))
            );
        }
    }

    public putWeights(num_neurons_per_layer: number[], weights_and_biases: number[]): void {

        this.num_neurons_per_layer = num_neurons_per_layer;

        this.computeOffsets();

        let N = NeuralNet.weightsCount(num_neurons_per_layer);

        if (N !== weights_and_biases.length)
            throw new Error(`The number of weights do not match the given architecture, expected ${N}, got ${weights_and_biases.length}.`);

        this.weights_and_biases = weights_and_biases;
    }

    //returns the number of weights (biases included) for a given architecture
    static weightsCount(num_neurons_per_layer: number[]): number {

        let count = 0;

        for (let l = 1; l < num_neurons_per_layer.length; l++)
            count += num_neurons_per_layer[l] * (num_neurons_per_layer[l - 1] + 1);

        return count;
    }

    public toJSON(): Object {

        return {
            weights_and_biases: this.weights_and_biases,
            layers: this.num_neurons_per_layer
        }

    }

    public toFunction(): NeuralNetFunction {
        return {
            args: ['inputs'],
            body: `
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
        `
        };
    }

    static fromJSON(json: { weights_and_biases: number[], layers: number[] }): NeuralNet {
        const NN = new NeuralNet();

        NN.putWeights(json.layers, json.weights_and_biases);

        return NN;
    }

    static fromWeights(num_neurons_per_layer: number[], weights_and_biases: number[]): NeuralNet {
        const NN = new NeuralNet();
        NN.putWeights(num_neurons_per_layer, weights_and_biases);

        return NN;
    }

}