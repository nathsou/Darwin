import { Point } from "./TSP";
export declare class TSP_Optimizer {
    private CITY_COUNT;
    private genetics;
    private tsp;
    private shuffled;
    private model;
    private convergence_treshold;
    private max_generation;
    private fitness_k;
    constructor(cities?: Point[]);
    private newGen;
    optimize(): IterableIterator<number[]>;
    drawShortestPath(ctx: CanvasRenderingContext2D): void;
    getGeneration(): number;
}
