export function shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const swap_idx = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[swap_idx]] = [arr[swap_idx], arr[i]];
    }

    return arr;
}