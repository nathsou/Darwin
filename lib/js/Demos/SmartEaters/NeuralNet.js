"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NeuralNet {
    constructor() {
        this.weights_and_biases = [];
    }
    getWeight(l, j, k) {
        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1) + k + 1];
    }
    getBias(l, j) {
        return this.weights_and_biases[this.offsets[l - 1] + j * (this.num_neurons_per_layer[l - 1] + 1)];
    }
    feedforward(inputs) {
        if (this.weights_and_biases.length === 0)
            throw new Error(`Cannot feedforward before 'putWeights' or 'fromJSON' was called.`);
        if (inputs.length !== this.num_neurons_per_layer[0])
            throw new Error(`Expected ${this.num_neurons_per_layer[0]} inputs, got ${inputs.length}.`);
        let a = inputs, output;
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
    run(...inputs) {
        return this.feedforward(inputs);
    }
    computeOffsets() {
        this.offsets = [0];
        let offset = 0;
        for (let l = 1; l < this.num_neurons_per_layer.length - 1; l++) {
            this.offsets.push((offset += this.num_neurons_per_layer[l - 1] * (this.num_neurons_per_layer[l] + 1)));
        }
    }
    putWeights(num_neurons_per_layer, weights_and_biases) {
        this.num_neurons_per_layer = num_neurons_per_layer;
        this.computeOffsets();
        let N = NeuralNet.weightsCount(num_neurons_per_layer);
        if (N !== weights_and_biases.length)
            throw new Error(`The number of weights do not match the given architecture, expected ${N}, got ${weights_and_biases.length}.`);
        this.weights_and_biases = weights_and_biases;
    }
    //returns the number of weights (biases included) for a given architecture
    static weightsCount(num_neurons_per_layer) {
        let count = 0;
        for (let l = 1; l < num_neurons_per_layer.length; l++)
            count += num_neurons_per_layer[l] * (num_neurons_per_layer[l - 1] + 1);
        return count;
    }
    toJSON() {
        return {
            weights_and_biases: this.weights_and_biases,
            layers: this.num_neurons_per_layer
        };
    }
    toFunction() {
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
    static fromJSON(json) {
        const NN = new NeuralNet();
        NN.putWeights(json.layers, json.weights_and_biases);
        return NN;
    }
    static fromWeights(num_neurons_per_layer, weights_and_biases) {
        const NN = new NeuralNet();
        NN.putWeights(num_neurons_per_layer, weights_and_biases);
        return NN;
    }
}
exports.NeuralNet = NeuralNet;
