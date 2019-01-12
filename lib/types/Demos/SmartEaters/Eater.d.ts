import { Vector2D } from "./Vector2D";
export declare class Eater {
    closest_food: Vector2D;
    food_dir: Vector2D;
    lookat: Vector2D;
    private _pos;
    private _angle;
    private chromosomeIdx;
    constructor(pos: Vector2D, angle: number, chromosomeIdx: number);
    getChromosomeIdx(): number;
    position: Vector2D;
    angle: number;
}
