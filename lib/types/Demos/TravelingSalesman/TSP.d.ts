export interface Point {
    x: number;
    y: number;
}
export declare class TSP {
    private cities;
    private distMap;
    constructor(cities: Point[]);
    private dist2D;
    private dist2DSquared;
    checkPathValidity(path: number[]): boolean;
    distance(path: number[]): number;
    distanceSquared(path: number[]): number;
    getCities(): Point[];
    getCity(idx: number): Point;
    draw(ctx: CanvasRenderingContext2D, path: number[]): void;
}
