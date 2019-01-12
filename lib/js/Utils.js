"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Sort the k largest elements
function partialQuickSort(array, k) {
    partial_quicksort(array, 0, array.length - 1, k);
    return array;
}
exports.partialQuickSort = partialQuickSort;
function partial_quicksort(array, left, right, k) {
    const pivot = Math.floor((left + right) / 2);
    if (left < right) {
        const p = partition(array, pivot, left, right);
        partial_quicksort(array, left, p - 1, k);
        if (p < k) {
            partial_quicksort(array, p, right, k);
        }
    }
}
function partition(array, pivot, left, right) {
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
function swap(array, a, b) {
    if (a === b)
        return;
    const tmp = array[a];
    array[a] = array[b];
    array[b] = tmp;
}
