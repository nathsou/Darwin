import { Point } from "./TSP";
export declare class TSPOptimizer {
    private CITY_COUNT;
    private genetics;
    private tsp;
    private shuffled;
    private model;
    private convergence_threshold;
    private max_generation;
    private fitness_k;
    private best_path;
    constructor(cities?: Point[]);
    private pathFitness;
    private distanceFromFitness;
    private newGen;
    optimize(): IterableIterator<number[]>;
    drawShortestPath(ctx: CanvasRenderingContext2D): void;
    getGeneration(): number;
}
