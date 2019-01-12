import { Vector2D } from "./Vector2D";
import { MathUtils } from "./MathUtils";

export class Eater {

    public closest_food: Vector2D;
    public food_dir: Vector2D;
    public lookat: Vector2D;
    private pos: Vector2D;
    private angle: number;
    private chromosomeIdx: number;

    constructor(pos: Vector2D, angle: number, chromosomeIdx: number) {
        this.pos = pos;
        this.angle = angle;
        this.chromosomeIdx = chromosomeIdx;
    }

    getChromosomeIdx(): number {
        return this.chromosomeIdx;
    }

    getPosition(): Vector2D {
        return this.pos;
    }

    setPosition(new_pos: Vector2D): void {
        this.pos = new_pos;
    }

    getAngle(): number {
        return this.angle;
    }

    setAngle(angle: number): void {
        this.angle = angle % MathUtils.TWO_PI;
    }
}