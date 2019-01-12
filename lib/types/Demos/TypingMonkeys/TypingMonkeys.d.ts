import { DarwinParams } from "../../Darwin";
import { Chromosome } from "../../Chromosome";
export declare const alphabet: string[];
export declare function rand_char(): string;
export interface GenerationInfo {
    avg_fitness: number;
    fittest: Chromosome<string>;
    generation: number;
}
export declare class MonkeyFactory {
    private params;
    constructor(params: DarwinParams<string>);
    search(target: string): IterableIterator<GenerationInfo>;
    getParams(): Readonly<DarwinParams<string>>;
    setParams(params: DarwinParams<string>): void;
}
