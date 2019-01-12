"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shuffle(a) {
    for (let i = a.length; i !== 0; i--) {
        const j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return a;
}
exports.shuffle = shuffle;
