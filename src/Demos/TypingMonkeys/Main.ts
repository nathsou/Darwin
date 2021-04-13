import { MonkeyFactory } from "./TypingMonkeys";
import { alphabet } from '../common/Text';
import { h, appendChildren, namedInput } from '../common/Utils';

const br = () => h('br');

const targetInput = h('input', {
    type: 'text',
    value: 'https://en.wikipedia.org/wiki/Genetic_algorithm'
}, {
    width: '400px'
});

const searchButton = h('button', {
    textContent: 'Go'
});

const fittest = h('p', {}, {
    fontSize: '24px'
});

const statsDiv = h('div', {}, {
    fontSize: '24px'
});

const population = namedInput('Population', {
    type: 'number',
    value: '200'
});

const crossover = namedInput('Crossover rate', {
    type: 'number',
    value: '0.7',
    min: '0',
    max: '1',
    step: '0.01'
});

const mutation = namedInput('Mutation rate', {
    type: 'number',
    value: '0.02',
    min: '0',
    max: '1',
    step: '0.01'
});

const eliteCount = namedInput('Elite count', {
    type: 'number',
    value: '15'
});

const eliteCopies = namedInput('Elite copies', {
    type: 'number',
    value: '2'
});

const paramsDiv = appendChildren(h('div', {}, {
    width: '350px'
}), [
    population.elem,
    crossover.elem,
    mutation.elem,
    eliteCount.elem,
    eliteCopies.elem
]);

appendChildren(document.body, [
    targetInput,
    searchButton,
    br(),
    fittest,
    br(),
    statsDiv,
    br(),
    paramsDiv
]);

searchButton.addEventListener('click', () => {
    const target = targetInput.value;

    const invalidChar = target.split('').find(char => !alphabet.includes(char));
    if (invalidChar) {
        alert(`The character '${invalidChar}' cannot be used`);
    } else {
        const factory = new MonkeyFactory({
            populationSize: parseInt(population.value()),
            chromosomeLength: target.length,
            crossoverRate: parseFloat(crossover.value()),
            mutationRate: parseFloat(mutation.value()),
            eliteCount: parseInt(eliteCount.value(), 10),
            eliteCopies: parseInt(eliteCopies.value(), 10)
        });

        const iterator = factory.search(target);

        const update = () => {
            const data = iterator.next();
            fittest.textContent = data.value.fittest.getGenes().join('');

            const maxFitness = Math.log2(data.value.fittest.getFitness()) / target.length;
            const averageFitness = Math.log2(data.value.averageFitness) / target.length;

            statsDiv.innerHTML =
                `generation: ${data.value.generation}</br>
                average fitness: ${(averageFitness * 100).toFixed(4)}% </br>
                max fitness: ${(maxFitness * 100).toFixed(4)}% `;

            if (!data.done) {
                requestAnimationFrame(update);
            }
        };

        update();
    }
});