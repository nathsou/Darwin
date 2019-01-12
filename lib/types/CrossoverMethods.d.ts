import { Chromosome, Offspring } from "./Chromosome";
export declare enum CrossoverMethod {
    SINGLE_POINT = 0,
    TWO_POINT = 1,
    UNIFORM = 2,
    HALF_UNIFORM = 3,
    ORDERED = 4
}
export declare type CustomCrossoverMethod<T> = (bob: Chromosome<T>) => Offspring<T>;
