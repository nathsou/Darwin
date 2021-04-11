
export function shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[swapIndex]] = [arr[swapIndex], arr[i]];
    }

    return arr;
}