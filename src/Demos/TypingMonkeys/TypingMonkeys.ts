import { Darwin, DarwinParams } from "../../Darwin";
import { Chromosome } from "../../Chromosome";

export const alphabet = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', '?', '!', '.', '#', '@', '&', '*', '$', '%', '+', '-', '/', '=',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', "'", '"', ':', '_', '-'
];

export function randChar(): string {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function stringDist(a: string, b: string): number {
    let diff = 0, e = Math.max(a.length, b.length) - Math.min(a.length, b.length);

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        diff += Number(a[i] !== b[i]);
    }

    return diff + e;
}

export interface GenerationInfo {
    averageFitness: number,
    fittest: Chromosome<string>,
    generation: number
}

export class MonkeyFactory {
    private params: DarwinParams<string>;

    constructor(params: Omit<DarwinParams<string>, 'randomGene' | 'randomNumber'>) {
        this.params = { ...params, randomGene: randChar };
    }

    public *search(target: string): Iterator<GenerationInfo> {
        this.params.chromosomeLength = target.length;
        const population = new Darwin(this.params);

        while (true) {
            // update the fitness
            for (const bob of population.getPopulation()) {
                const p = bob.getGenes().join('');
                const d = stringDist(p, target);

                bob.setFitness(2 ** (target.length - d));

                if (d === 0) {
                    return {
                        generation: population.getGeneration(),
                        averageFitness: population.getAverageFitness(),
                        fittest: bob
                    };
                }
            }

            // mating time!
            population.mate();

            yield {
                averageFitness: population.getAverageFitness(),
                fittest: population.getFittest(),
                generation: population.getGeneration()
            };
        }
    }
}
