"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = void 0;
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[swapIndex]] = [arr[swapIndex], arr[i]];
    }
    return arr;
}
exports.shuffle = shuffle;
