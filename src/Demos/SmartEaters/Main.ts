import { crossoverMethod } from '../../CrossoverMethods';
import { SmartEaters, DPR } from './SmartEaters';

const cnv = document.createElement('canvas');
const ctx = cnv.getContext('2d');

cnv.width = window.innerWidth * DPR;
cnv.height = window.innerHeight * DPR;

cnv.style.width = `${window.innerWidth}px`;
cnv.style.height = `${window.innerHeight}px`;

ctx?.scale(DPR, DPR);

document.body.style.padding = '0';
document.body.style.margin = '0';
document.body.appendChild(cnv);

const eaters = new SmartEaters(cnv, {
    eliteCount: 5,
    eliteCopies: 2,
    ticksPerGen: 2000,
    populationSize: 100,
    foodCount: 120,
    crossoverMethod: crossoverMethod.twoPoint,
    wrapBorders: true,
    mutationRate: 0.02,
    hiddenLayersSizes: [8]
});

eaters.run();

window.addEventListener('resize', () => {
    cnv.style.width = `${window.innerWidth}px`;
    cnv.style.height = `${window.innerHeight}px`;
    cnv.width = window.innerWidth * DPR;
    cnv.height = window.innerHeight * DPR;
    ctx?.scale(DPR, DPR);
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