import { Chromosome } from "./Chromosome";

// Sort the k largest elements
export function partialQuickSort<T>(array: Chromosome<T>[], k: number): Chromosome<T>[] {
    partial_quicksort(array, 0, array.length - 1, k);
    return array;
}

function partial_quicksort<T>(array: Chromosome<T>[], left: number, right: number, k: number): void {
    const pivot = Math.floor((left + right) / 2);

    if (left < right) {
        const p = partition(array, pivot, left, right);

        partial_quicksort(array, left, p - 1, k);

        if (p < k) {
            partial_quicksort(array, p, right, k);
        }
    }
}

function partition<T>(array: Chromosome<T>[], pivot: number, left: number, right: number): number {

    const pivot_value = array[pivot].getFitness();

    while (left <= right) {
        while (array[left].getFitness() > pivot_value) {
            left++;
        }

        while (array[right].getFitness() < pivot_value) {
            right--;
        }

        if (left <= right) {
            swap(array, left, right);
            left++;
            right--;
        }
    }

    return left;
}

function swap(array: any[], a: number, b: number): void {
    if (a === b) return;

    const tmp = array[a];
    array[a] = array[b];
    array[b] = tmp;
}