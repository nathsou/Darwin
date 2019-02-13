"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const swap_idx = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[swap_idx]] = [arr[swap_idx], arr[i]];
    }
    return arr;
}
exports.shuffle = shuffle;
