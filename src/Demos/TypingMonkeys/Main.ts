import { alphabet, MonkeyFactory, rand_char } from "./TypingMonkeys";

function elem(name: string, props: { [key: string]: string } = {}): HTMLElement {
    const el = document.createElement(name);

    for (const prop in props) {
        ///@ts-ignore
        el[prop] = props[prop];
    }

    return el;
}

function appendChildren(...chilren: ChildNode[]): void {
    for (const child of chilren) {
        document.body.appendChild(child);
    }
}

function span(text: string): HTMLSpanElement {
    return elem('span', {
        textContent: text
    });
}

function br(): HTMLBRElement {
    return document.createElement('br');
}

const target_input = elem('input', {
    type: 'text',
    id: 'target',
    style: 'width: 400px;',
    value: 'https://en.wikipedia.org/wiki/Genetic_algorithm'
});

const search_btn = elem('button', {
    id: 'search',
    textContent: 'Go'
});

const fittest = elem('p', {
    id: 'fittest',
    style: 'font-size: 24px'
});

const stats_div = elem('div', {
    id: 'statsDiv',
    style: 'font-size: 24px'
});

const population = elem('input', {
    type: 'number',
    id: 'population',
    style: 'width: 70px;',
    value: '200'
});

const crossover = elem('input', {
    type: 'number',
    id: 'crossover',
    style: 'width: 70px;',
    value: '0.7',
    min: '0',
    max: '1',
    step: '0.01'
});

const mutation = elem('input', {
    type: 'number',
    id: 'mutation',
    style: 'width: 70px;',
    value: '0.02',
    min: '0',
    max: '1',
    step: '0.01'
});

const elite_count = elem('input', {
    type: 'number',
    id: 'elite_count',
    style: 'width: 70px;',
    value: '15'
});

const elite_copies = elem('input', {
    type: 'number',
    id: 'elite_copies',
    style: 'width: 70px;',
    value: '2'
});

appendChildren(
    target_input,
    search_btn,
    br(),
    fittest,
    br(),
    stats_div,
    br(),
    span('Population '),
    population,
    br(),
    span('Crossover rate '),
    crossover,
    br(),
    span('Mutation rate '),
    mutation,
    br(),
    span('Elite count '),
    elite_count,
    br(),
    span('Elite copies '),
    elite_copies
);

search_btn.addEventListener('click', () => {

    const target = (target_input as HTMLInputElement).value;

    for (const char of target) {
        if (alphabet.indexOf(char) === -1) {
            alert(`The character '${char}' cannot be used`);
            return;
        }
    }

    const factory = new MonkeyFactory({
        population_size: parseInt((population as HTMLInputElement).value),
        chromosome_length: target.length,
        rand_gene: rand_char,
        crossover_rate: parseFloat((crossover as HTMLInputElement).value),
        mutation_rate: parseFloat((mutation as HTMLInputElement).value),
        elite_count: parseInt((elite_count as HTMLInputElement).value),
        elite_copies: parseInt((elite_copies as HTMLInputElement).value)
    });

    const iterator = factory.search(target);

    const update = () => {
        const data = iterator.next();

        fittest.textContent = data.value.fittest.getGenes().join('');

        const max_fitness = Math.log2(data.value.fittest.getFitness()) / target.length;
        const avg_fitness = Math.log2(data.value.avg_fitness) / target.length;

        // console.log(data.value);

        stats_div.innerHTML =
            `generation: ${data.value.generation}</br>
            average fitness: ${(avg_fitness * 100).toFixed(4)}% </br>
            max fitness: ${ (max_fitness * 100).toFixed(4)}% `;

        if (!data.done) {
            requestAnimationFrame(update);
        }
    };

    update();
});