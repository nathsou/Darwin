import { Vector2D } from "./Vector2D";
import { MathUtils } from "./MathUtils";

export class Eater {
    public closestFood: Vector2D;
    public foodDir: Vector2D;
    public lookat: Vector2D;
    private pos: Vector2D;
    private angle: number;
    private chromosomeIdx: number;

    constructor(pos: Vector2D, angle: number, chromosomeIdx: number) {
        this.pos = pos;
        this.angle = angle;
        this.chromosomeIdx = chromosomeIdx;
    }

    public getChromosomeIdx(): number {
        return this.chromosomeIdx;
    }

    public getPosition(): Vector2D {
        return this.pos;
    }

    public setPosition(newPosition: Vector2D) {
        this.pos = newPosition;
    }

    public getAngle(): number {
        return this.angle;
    }

    public setAngle(angle: number) {
        this.angle = angle % MathUtils.TWO_PI;
    }
}