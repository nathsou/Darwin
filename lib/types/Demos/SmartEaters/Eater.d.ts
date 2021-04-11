import { Vector2D } from "./Vector2D";
export declare class Eater {
    closestFood: Vector2D;
    foodDir: Vector2D;
    lookat: Vector2D;
    private pos;
    private angle;
    private chromosomeIdx;
    constructor(pos: Vector2D, angle: number, chromosomeIdx: number);
    getChromosomeIdx(): number;
    getPosition(): Vector2D;
    setPosition(newPosition: Vector2D): void;
    getAngle(): number;
    setAngle(angle: number): void;
}
