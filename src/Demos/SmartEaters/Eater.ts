import { Vector2D } from "./Vector2D";

export type Eater = ReturnType<typeof createEater>;

export const createEater = (position: Vector2D, angle: number, chromosomeIndex: number) => {
    let closestFood = new Vector2D(0, 0);
    let foodDir = new Vector2D(0, 0);
    let lookat = new Vector2D(0, 0);

    return {
        closestFood, foodDir, lookat,
        position, angle,
        getChromosomeIndex: () => chromosomeIndex
    };
};