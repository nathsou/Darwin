"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectKBest = void 0;
function selectKBest(array, k) {
    reversePartialQuicksort(array, k);
    return array.slice(0, k);
}
exports.selectKBest = selectKBest;
function quicksort(arr, from = 0, to = arr.length - 1) {
    const pivot = arr[Math.floor((from + to) / 2)].getFitness();
    if (from < to) {
        const p = partition(arr, from, to, pivot);
        quicksort(arr, from, p - 1);
        quicksort(arr, p, to);
    }
}
function reversePartialQuicksort(arr, k, from = 0, to = arr.length - 1) {
    const pivot = arr[Math.floor((from + to) / 2)].getFitness();
    if (from < to) {
        const p = partition(arr, from, to, pivot);
        quicksort(arr, from, p - 1);
        if (p < k) {
            quicksort(arr, p, to);
        }
    }
}
function partition(array, left, right, pivot) {
    // put every element smaller than the pivot to its left
    // and every element bigger to its right
    // returning the pivot's position
    while (left <= right) {
        while (array[left].getFitness() > pivot) {
            left++;
        }
        while (array[right].getFitness() < pivot) {
            right--;
        }
        if (left <= right) {
            [array[left], array[right]] = [array[right], array[left]];
            left++;
            right--;
        }
    }
    return left;
}
