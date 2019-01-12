import { Darwin, DarwinParams } from "../../Darwin";
import { Chromosome } from "../../Chromosome";

export const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', '?', '!', '.', '#', '@', '&', '*', '$', '%', '+', '-', '/', '=',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', "'", '"', ':', '_', '-'];

export function rand_char(): string {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function string_dist(a: string, b: string): number {
    let diff = 0, e = Math.max(a.length, b.length) - Math.min(a.length, b.length);

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        diff += Number(a[i] !== b[i]);
    }

    return diff + e;
}

export interface GenerationInfo {
    avg_fitness: number,
    fittest: Chromosome<string>,
    generation: number
}

export class MonkeyFactory {

    private params: DarwinParams<string>

    constructor(params: DarwinParams<string>) {
        this.params = params;
        this.params.rand_func = rand_char;
    }

    public *search(target: string): IterableIterator<GenerationInfo> {

        this.params.chromosome_length = target.length;

        const genetics = new Darwin<string>(this.params);

        while (true) {

            // update the fitness
            for (const bob of genetics.getPopulation()) {
                const p = bob.getBits().join('');
                const d = string_dist(p, target);

                bob.setFitness(2 ** (target.length - d));

                if (d === 0) {
                    return {
                        generation: genetics.getGeneration(),
                        avg_fitness: genetics.getAverageFitness(),
                        fittest: bob
                    };
                }
            }

            // mating time!
            genetics.mate();

            yield {
                avg_fitness: genetics.getAverageFitness(),
                fittest: genetics.getFittest(),
                generation: genetics.getGeneration()
            };
        }

    }

    public getParams(): Readonly<DarwinParams<string>> {
        return this.params;
    }

    public setParams(params: DarwinParams<string>): void {
        this.params = params;
    }
}
