export interface Point {
    x: number;
    y: number;
}
export declare class TSP {
    private cities;
    private dist_map;
    constructor(cities: Point[]);
    private dist2D;
    private dist2D_squared;
    checkPathValidity(path: number[]): boolean;
    distance(path: number[]): number;
    distance_squared(path: number[]): number;
    getCities(): Point[];
    getCity(idx: number): Point;
    draw(ctx: CanvasRenderingContext2D, path: number[]): void;
}
