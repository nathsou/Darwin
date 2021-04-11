
// minified version, only implements feedforwarding
export class NeuralNet {
    private weightsAndBiases: number[] = [];
    private numNeuronsPerLayer: number[];
    private offsets: number[]; // for optimization purposes

    public getWeight(l: number, j: number, k: number): number {
        return this.weightsAndBiases[this.offsets[l - 1] + j * (this.numNeuronsPerLayer[l - 1] + 1) + k + 1];
    }

    public getBias(l: number, j: number): number {
        return this.weightsAndBiases[this.offsets[l - 1] + j * (this.numNeuronsPerLayer[l - 1] + 1)];
    }

    public feedforward(inputs: number[]): number[] {
        if (this.weightsAndBiases.length === 0) {
            throw new Error(`Cannot feedforward before 'putWeights' or 'fromJSON' was called.`);
        }

        if (inputs.length !== this.numNeuronsPerLayer[0]) {
            throw new Error(`Expected ${this.numNeuronsPerLayer[0]} inputs, got ${inputs.length}.`);
        }

        let a = inputs;
        let output: number[] = [];

        for (let l = 1; l < this.numNeuronsPerLayer.length; l++) {
            output = [];
            for (let j = 0; j < this.numNeuronsPerLayer[l]; j++) {
                let z = this.getBias(l, j);
                for (let k = 0; k < this.numNeuronsPerLayer[l - 1]; k++)
                    z += this.getWeight(l, j, k) * a[k];
                output[j] = 1 / (1 + Math.exp(-z));
            }
            a = output;
        }

        return output;
    }

    // alias to feedforward
    public run(...inputs: number[]): number[] {
        return this.feedforward(inputs);
    }

    private computeOffsets(): void {
        this.offsets = [0];
        let offset = 0;

        for (let l = 1; l < this.numNeuronsPerLayer.length - 1; l++) {
            this.offsets.push(
                (offset += this.numNeuronsPerLayer[l - 1] * (this.numNeuronsPerLayer[l] + 1))
            );
        }
    }

    public putWeights(numNeuronsPerLayer: number[], weightsAndBiases: number[]): void {
        this.numNeuronsPerLayer = numNeuronsPerLayer;
        this.computeOffsets();

        const n = NeuralNet.weightsCount(numNeuronsPerLayer);

        if (n !== weightsAndBiases.length) {
            throw new Error(`The number of weights do not match the given architecture, expected ${n}, got ${weightsAndBiases.length}.`);
        }

        this.weightsAndBiases = weightsAndBiases;
    }

    //returns the number of weights (biases included) for a given architecture
    static weightsCount(numNeuronsPerLayer: number[]): number {
        let count = 0;

        for (let l = 1; l < numNeuronsPerLayer.length; l++) {
            count += numNeuronsPerLayer[l] * (numNeuronsPerLayer[l - 1] + 1);
        }

        return count;
    }

    public toJSON(): Object {
        return {
            weights_and_biases: this.weightsAndBiases,
            layers: this.numNeuronsPerLayer
        }

    }

    static fromJSON(json: { weightsAndbiases: number[], layers: number[] }): NeuralNet {
        const nn = new NeuralNet();
        nn.putWeights(json.layers, json.weightsAndbiases);

        return nn;
    }

    static fromWeights(numNeuronsPerLayer: number[], weightsAndBiases: number[]): NeuralNet {
        const nn = new NeuralNet();
        nn.putWeights(numNeuronsPerLayer, weightsAndBiases);

        return nn;
    }
}