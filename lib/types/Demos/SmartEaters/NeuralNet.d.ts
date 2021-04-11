export interface NeuralNetFunction {
    args: string[];
    body: string;
}
export declare class NeuralNet {
    private weightsAndBiases;
    private numNeuronsPerLayer;
    private offsets;
    getWeight(l: number, j: number, k: number): number;
    getBias(l: number, j: number): number;
    feedforward(inputs: number[]): number[];
    run(...inputs: number[]): number[];
    private computeOffsets;
    putWeights(num_neurons_per_layer: number[], weights_and_biases: number[]): void;
    static weightsCount(num_neurons_per_layer: number[]): number;
    toJSON(): Object;
    toFunction(): NeuralNetFunction;
    static fromJSON(json: {
        weights_and_biases: number[];
        layers: number[];
    }): NeuralNet;
    static fromWeights(num_neurons_per_layer: number[], weights_and_biases: number[]): NeuralNet;
}
