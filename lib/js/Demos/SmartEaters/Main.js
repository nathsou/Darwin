"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CrossoverMethods_1 = require("../../CrossoverMethods");
const SmartEaters_1 = require("./SmartEaters");
const cnv = document.createElement('canvas');
const ctx = cnv.getContext('2d');
cnv.width = window.innerWidth * SmartEaters_1.DPR;
cnv.height = window.innerHeight * SmartEaters_1.DPR;
cnv.style.width = `${window.innerWidth}px`;
cnv.style.height = `${window.innerHeight}px`;
ctx === null || ctx === void 0 ? void 0 : ctx.scale(SmartEaters_1.DPR, SmartEaters_1.DPR);
document.body.style.padding = '0';
document.body.style.margin = '0';
document.body.appendChild(cnv);
const eaters = new SmartEaters_1.SmartEaters(cnv, {
    eliteCount: 5,
    eliteCopies: 2,
    ticksPerGen: 2000,
    populationSize: 100,
    foodCount: 120,
    crossoverMethod: CrossoverMethods_1.CrossoverMethod.TWO_POINT,
    wrapBorders: true,
    mutationRate: 0.02,
    hiddenLayersSizes: [8]
});
eaters.run();
window.addEventListener('resize', () => {
    cnv.style.width = `${window.innerWidth}px`;
    cnv.style.height = `${window.innerHeight}px`;
    cnv.width = window.innerWidth * SmartEaters_1.DPR;
    cnv.height = window.innerHeight * SmartEaters_1.DPR;
    ctx === null || ctx === void 0 ? void 0 : ctx.scale(SmartEaters_1.DPR, SmartEaters_1.DPR);
});
window.addEventListener('keypress', e => {
    switch (e.key) {
        case ' ': // space
            eaters.pause();
            break;
        case 'f': // follow the fittest eater
            eaters.followFittest = !eaters.followFittest;
            break;
        case 'p': // decrement fresh rate
            eaters.fastModeRefreshRate += 2;
            break;
        case 'm': // increment fresh rate
            eaters.fastModeRefreshRate -= 2;
            if (eaters.fastModeRefreshRate < 1)
                eaters.fastModeRefreshRate = 1;
            break;
        case 'l': // draw lines to the nearest food for each eater
            eaters.showLines = !eaters.showLines;
            break;
        case 'h': // hide all eaters but the selected one
            eaters.hideNonSelected = !eaters.hideNonSelected;
            break;
        case 'a': // isolate the selected eater
            if (eaters.getSelectedIndex()) {
                const brain = eaters.getEaterBrain(eaters.getSelectedIndex());
                const b = window.URL.createObjectURL(new Blob([`
                {
                    'params': ${JSON.stringify(eaters.getParameters())},
                    'brain': ${JSON.stringify(brain)}
                }
                `]));
                window.open(`analysis.html?b=${b}`);
            }
            break;
        default:
            eaters.toggleFastMode();
            break;
    }
});
