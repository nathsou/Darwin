import { Point } from "./TSP";
export declare class TSPOptimizer {
    private CITY_COUNT;
    private genetics;
    private tsp;
    private shuffled;
    private model;
    private convergenceThreshold;
    private maxGenerations;
    private fitnessFactor;
    private bestPath;
    constructor(cities?: Point[]);
    private pathFitness;
    private distanceFromFitness;
    private newGen;
    optimize(): IterableIterator<number[]>;
    drawShortestPath(ctx: CanvasRenderingContext2D): void;
    getGeneration(): number;
}
