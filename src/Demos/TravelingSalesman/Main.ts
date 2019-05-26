import { TSPOptimizer } from "./TSPOptimizer";

const cnv = document.createElement('canvas');
const ctx = cnv.getContext('2d');

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

const tsp_opt = new TSPOptimizer(cities);

const optimizer = tsp_opt.optimize();

const update = () => {
    const data = optimizer.next();
    tsp_opt.drawShortestPath(ctx);

    if (!data.done) {
        requestAnimationFrame(update);
    }
};

update();

tsp_opt.drawShortestPath(ctx);