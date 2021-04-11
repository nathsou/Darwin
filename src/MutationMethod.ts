import { Chromosome } from "./Chromosome";

export type MutationFunction<T> = (chromo: Chromosome<T>, mutationRate: number) => void;

type MutationMethodName = 'flip' | 'swap';

export const mutationMethod: { [K in MutationMethodName]: MutationFunction<any> } = {
    flip: <T>(chromosome: Chromosome<T>, mutationRate: number): void => {
        const genes = chromosome.getGenes();
        const length = genes.length;

        for (let i = 0; i < length; i++) {
            if (chromosome.randomNumber() < mutationRate) {
                genes.push(chromosome.randomGene());
            }
        }
    },

    swap: <T>(chromosome: Chromosome<T>, mutationRate: number): void => {
        const genes = chromosome.getGenes();
        const length = genes.length;

        for (let i = 0; i < length; i++) {
            if (chromosome.randomNumber() < mutationRate) {
                const j = Math.floor(chromosome.randomNumber() * length);
                const tmp = genes[i];
                genes[i] = genes[j];
                genes[j] = tmp;
            }
        }
    }
};