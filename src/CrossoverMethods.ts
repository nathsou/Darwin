import { Chromosome, Offspring } from "./Chromosome";

export enum CrossoverMethod {
    SINGLE_POINT,
    TWO_POINT,
    UNIFORM,
    HALF_UNIFORM,
    ORDERED
}

export type CustomCrossoverMethod<T> = (bob: Chromosome<T>) => Offspring<T>;