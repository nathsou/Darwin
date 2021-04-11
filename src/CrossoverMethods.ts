import { Chromosome, Offspring } from "./Chromosome";

export type CrossoverFunction<T> = (alice: Chromosome<T>, bob: Chromosome<T>) => Offspring<T>;

type CrossoverMethodName = 'singlePoint' | 'twoPoint' | 'uniform' | 'halfUniform' | 'ordered';

export const CrossoverMethod: { [K in CrossoverMethodName]: CrossoverFunction<any> } = {
    singlePoint: <T>(alice: Chromosome<T>, bob: Chromosome<T>): Offspring<T> => {
        const p = Math.floor(Math.random() * alice.getGenes().length);
        const b1 = [...alice.getGenes().slice(0, p), ...bob.getGenes().slice(p)];
        const b2 = [...bob.getGenes().slice(0, p), ...alice.getGenes().slice(p)];

        return [b1, b2];
    },

    twoPoint: <T>(alice: Chromosome<T>, bob: Chromosome<T>): Offspring<T> => {
        const b1: T[] = [];
        const b2: T[] = [];

        const alicesGenes = alice.getGenes();
        const bobsGenes = bob.getGenes();
        const aliceChromoLength = alice.getGenes().length;

        let p1 = Math.floor(Math.random() * aliceChromoLength);
        let p2 = Math.floor(Math.random() * aliceChromoLength);

        if (p1 > p2) {
            [p1, p2] = [p2, p1];
        }

        for (let i = 0; i < aliceChromoLength; i++) {
            b1.push(i < p1 ? alicesGenes[i] : (i < p2 ? bobsGenes[i] : alicesGenes[i]));
            b2.push(i < p1 ? bobsGenes[i] : (i < p2 ? alicesGenes[i] : bobsGenes[i]));
        }

        return [b1, b2];
    },

    uniform: <T>(alice: Chromosome<T>, bob: Chromosome<T>): Offspring<T> => {
        const b1: T[] = [];
        const b2: T[] = [];

        const alicesGenes = alice.getGenes();
        const bobsGenes = bob.getGenes();
        const aliceChromoLength = alice.getGenes().length;

        for (let i = 0; i < aliceChromoLength; i++) {
            let swap = Math.random() < 0.5;
            b1.push(swap ? bobsGenes[i] : alicesGenes[i]);
            b2.push(swap ? alicesGenes[i] : bobsGenes[i]);
        }

        return [b1, b2];
    },

    halfUniform: <T>(alice: Chromosome<T>, bob: Chromosome<T>): Offspring<T> => {
        let b1: T[] = [];
        let b2: T[] = [];

        const alicesGenes = alice.getGenes();
        const bobsGenes = bob.getGenes();
        const aliceChromoLength = alice.getGenes().length;

        const diffBits: number[] = [];

        for (let i = 0; i < aliceChromoLength; i++) {
            if (alicesGenes[i] !== bobsGenes[i]) {
                diffBits.push(i);
            }
        }

        const N = diffBits.length;

        b1 = alicesGenes.slice();
        b2 = bobsGenes.slice();

        for (let i = 0; i < N / 2; i++) {
            let idx = Math.floor(Math.random() * diffBits.length);
            b1[diffBits[idx]] = bobsGenes[diffBits[idx]];
            b2[diffBits[idx]] = alicesGenes[diffBits[idx]];
            diffBits.splice(idx, 1);
        }

        return [b1, b2];
    },

    ordered: <T>(alice: Chromosome<T>, bob: Chromosome<T>): Offspring<T> => {
        const b1: T[] = [];
        const b2: T[] = [];

        const alicesGenes = alice.getGenes();
        const bobsGenes = bob.getGenes();
        const aliceChromoLength = alice.getGenes().length;

        let inf = Math.floor(Math.random() * aliceChromoLength);
        let sup = Math.floor(Math.random() * aliceChromoLength);
        let tmp = inf;

        inf = Math.min(inf, sup);
        sup = Math.max(tmp, sup);

        for (let i = inf; i < sup; i++) {
            b1[i] = bobsGenes[i];
            b2[i] = alicesGenes[i];
        }

        for (let i = 0; i < aliceChromoLength; i++) {
            if (b1.indexOf(alicesGenes[i]) === -1) {
                b1[i] = alicesGenes[i];
            } else {
                for (let j = 0; j < aliceChromoLength; j++) {
                    if (b1.indexOf(alicesGenes[j]) === -1) {
                        b1[i] = alicesGenes[j];
                    }
                }
            }

            if (b2.indexOf(bobsGenes[i]) === -1) {
                b2[i] = bobsGenes[i];
            } else {
                for (let j = 0; j < bobsGenes.length; j++) {
                    if (b2.indexOf(bobsGenes[j]) === -1) {
                        b2[i] = bobsGenes[j];
                    }
                }
            }

        }

        return [b1, b2];
    }
};