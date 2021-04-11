"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TSPOptimizer_1 = require("./TSPOptimizer");
const cnv = document.createElement('canvas');
const ctx = cnv.getContext('2d');
if (ctx === null) {
    throw new Error(`Could not get a 2d canvas context`);
}
const dpr = window.devicePixelRatio;
cnv.width = window.innerWidth * dpr;
cnv.height = window.innerHeight * dpr;
cnv.style.width = `${window.innerWidth}px`;
cnv.style.height = `${window.innerHeight}px`;
ctx.scale(dpr, dpr);
document.body.style.padding = '0';
document.body.style.margin = '0';
document.body.appendChild(cnv);
const cities = [];
for (let i = 0; i < 40; i++) {
    cities.push({
        x: Math.floor(Math.random() * cnv.width),
        y: Math.floor(Math.random() * cnv.height)
    });
}
const tspOpt = new TSPOptimizer_1.TSPOptimizer(cities);
const optimizer = tspOpt.optimize();
const update = () => {
    const data = optimizer.next();
    tspOpt.drawShortestPath(ctx);
    if (!data.done) {
        requestAnimationFrame(update);
    }
};
update();
tspOpt.drawShortestPath(ctx);
