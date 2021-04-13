import { Chromosome } from "../../Chromosome";
import { Darwin, DarwinParams } from "../../Darwin";
import { randChar } from '../common/Text';

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
                        averageFitness: population.getStats().averageFitness,
                        fittest: bob
                    };
                }
            }

            // mating time!
            population.mate();

            const { averageFitness, fittest } = population.getStats();

            yield {
                averageFitness,
                fittest,
                generation: population.getGeneration()
            };
        }
    }
}
