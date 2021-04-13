
export namespace MathUtils {
    export const clamp = (value: number, min: number, max: number): number => {
        if (value >= min && value <= max) return value;
        if (value < min) return min;
        return max;
    };

    export const map = (value: number, start1: number, stop1: number, start2: number, stop2: number): number => {
        return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    };

    export const TWO_PI = 2 * Math.PI;
}