import { Chromosome } from "./Chromosome";

export type MutationFunction<T> = (chromo: Chromosome<T>, mutationRate: number) => void;

type MutationMethodName = 'flip' | 'swap';

export const mutationMethod: { [K in MutationMethodName]: MutationFunction<any> } = {
    flip: <T>(chromosome: Chromosome<T>, mutationRate: number): void => {
        const genes = chromosome.getGenes();
        const length = genes.length;

        for (let i = 0; i < length; i++) {
            if (chromosome.randomNumber() < mutationRate) {
                genes[i] = chromosome.randomGene();
            }
        }
    },

    swap: <T>(chromosome: Chromosome<T>, mutationRate: number): void => {
        const genes = chromosome.getGenes();
        const length = genes.length;

        for (let i = 0; i < length; i++) {
            if (chromosome.randomNumber() < mutationRate) {
                const j = Math.floor(Math.random() * length);
                [genes[i], genes[j]] = [genes[j], genes[i]];
            }
        }
    }
};