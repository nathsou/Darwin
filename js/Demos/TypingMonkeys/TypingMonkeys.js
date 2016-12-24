//Nathan Soufflet - 22/12/2016
/// <reference path="../../Darwin.ts" />
/// <reference path="EventEmitter.ts" />
let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', '?', '!', '.', '#', '@', '&', '*', '$', '%', '+', '-', '/', '=',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', "'", '"', ':', '_', '-'];
function rand_char() {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}
function string_dist(a, b) {
    let diff = 0, e = Math.max(a.length, b.length) - Math.min(a.length, b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++)
        diff += Number(a[i] !== b[i]);
    return diff + e;
}
class MonkeyFactory extends EventEmitter {
    constructor(params, time_limit = 20000) {
        super();
        this.params = params;
        this.time_limit = time_limit;
        this.params.rand_func = rand_char;
    }
    search(target) {
        let t1 = Date.now();
        this.params.chromosome_length = target.length;
        let genetics = new Darwin(this.params);
        evolution: while ((Date.now() - t1) < this.time_limit) {
            this.emit('new_generation', {
                avg_fitness: genetics.getAverageFitness(),
                fittest: genetics.getFittest(),
                generation: genetics.generation
            });
            //update the fitness
            for (let bob of genetics.getPopulation()) {
                let p = bob.getBits().join('');
                let d = string_dist(p, target);
                bob.setFitness(Math.pow(2, (target.length - d)));
                if (d === 0) {
                    this.emit('finished', {
                        generation: genetics.generation,
                        avg_fitness: genetics.getAverageFitness(),
                        fittest: bob
                    });
                    break evolution;
                }
            }
            //mating time!
            genetics.mate();
        }
        if ((Date.now() - t1) >= this.time_limit)
            this.emit('time_limit', this.time_limit);
    }
    getParams() {
        return this.params;
    }
    setParams(params) {
        this.params = params;
    }
}
