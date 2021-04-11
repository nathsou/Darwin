"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonkeyFactory = exports.randChar = exports.alphabet = void 0;
const Darwin_1 = require("../../Darwin");
exports.alphabet = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', '?', '!', '.', '#', '@', '&', '*', '$', '%', '+', '-', '/', '=',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', "'", '"', ':', '_', '-'
];
function randChar() {
    return exports.alphabet[Math.floor(Math.random() * exports.alphabet.length)];
}
exports.randChar = randChar;
function stringDist(a, b) {
    let diff = 0, e = Math.max(a.length, b.length) - Math.min(a.length, b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        diff += Number(a[i] !== b[i]);
    }
    return diff + e;
}
class MonkeyFactory {
    constructor(params) {
        this.params = Object.assign(Object.assign({}, params), { randGene: randChar });
    }
    *search(target) {
        this.params.chromosomeLength = target.length;
        const population = new Darwin_1.Darwin(this.params);
        while (true) {
            // update the fitness
            for (const bob of population.getPopulation()) {
                const p = bob.getGenes().join('');
                const d = stringDist(p, target);
                bob.setFitness(Math.pow(2, (target.length - d)));
                if (d === 0) {
                    return {
                        generation: population.getGeneration(),
                        averageFitness: population.getAverageFitness(),
                        fittest: bob
                    };
                }
            }
            // mating time!
            population.mate();
            yield {
                averageFitness: population.getAverageFitness(),
                fittest: population.getFittest(),
                generation: population.getGeneration()
            };
        }
    }
}
exports.MonkeyFactory = MonkeyFactory;
