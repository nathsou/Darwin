import { CrossoverMethod } from "../../CrossoverMethods";
import { SmartEaters, DPR } from "./SmartEaters";

const cnv = document.createElement('canvas');

cnv.width = window.innerWidth * DPR;
cnv.height = window.innerHeight * DPR;

cnv.style.width = `${window.innerWidth}px`;
cnv.style.height = `${window.innerHeight}px`;

cnv.getContext('2d').scale(DPR, DPR);

document.body.style.padding = '0';
document.body.style.margin = '0';
document.body.appendChild(cnv);

const eaters = new SmartEaters(cnv, {
    elite_count: 5,
    elite_copies: 2,
    ticks_per_gen: 2000,
    population_size: 100,
    food_count: 120,
    crossover_method: CrossoverMethod.TWO_POINT,
    wrap_borders: true,
    mutation_rate: 0.02,
    hidden_layers_sizes: [8]
});

eaters.run();

window.addEventListener('resize', () => {
    cnv.style.width = `${window.innerWidth}px`;
    cnv.style.height = `${window.innerHeight}px`;
    cnv.width = window.innerWidth * DPR;
    cnv.height = window.innerHeight * DPR;
    cnv.getContext('2d').scale(DPR, DPR);
});

window.addEventListener('keypress', e => {
    switch (e.key) {

        case " ": //SPACE
            eaters.pause();
            break;

        case "f": //follow the fittest eater
            eaters.follow_fittest = !eaters.follow_fittest;
            break;

        case "p": //decrement fresh rate
            eaters.fast_mode_refresh_rate += 2;
            break;

        case "m": //increment fresh rate
            eaters.fast_mode_refresh_rate -= 2;
            if (eaters.fast_mode_refresh_rate < 1)
                eaters.fast_mode_refresh_rate = 1;
            break;

        case "l": //draw lines to the nearest food for each eater
            eaters.show_lines = !eaters.show_lines;
            break;

        case "h": //hide all eaters but the selected one
            eaters.hide_non_selected = !eaters.hide_non_selected;
            break;

        case "a": //isolate the selected eater
            if (eaters.selectedIdx) {
                const brain = eaters.getEaterBrain(eaters.selectedIdx);
                const b = window.URL.createObjectURL(new Blob([`
                {
                    "params": ${JSON.stringify(eaters.parameters)},
                    "brain": ${JSON.stringify(brain)}
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