import { DarwinParams } from "../../Darwin";
import { Chromosome } from "../../Chromosome";
export declare const alphabet: string[];
export declare function randChar(): string;
export interface GenerationInfo {
    averageFitness: number;
    fittest: Chromosome<string>;
    generation: number;
}
export declare class MonkeyFactory {
    private params;
    constructor(params: Omit<DarwinParams<string>, 'randGene'>);
    search(target: string): Iterator<GenerationInfo>;
}
