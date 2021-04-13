import { appendChildren, h, namedInput } from '../common/Utils';
import { Deblurrer } from './Deblur';

const setup = () => {
    const text = namedInput('text', {
        type: 'text',
        value: 'DARWIN',
        onchange: onUpdate,
        onkeyup: onUpdate
    });

    const blurRadius = namedInput('blur radius', {
        type: 'range',
        min: '0',
        max: '10',
        step: '1',
        value: '4',
        onchange: onUpdate
    });

    const fontSize = namedInput('font size', {
        type: 'range',
        min: '10',
        max: '40',
        step: '1',
        value: '30',
        onchange: onUpdate
    });

    const populationSize = namedInput('population', {
        type: 'range',
        min: '5',
        max: '1000',
        step: '1',
        value: '200',
        onchange: onUpdate
    });

    const generation = h('p', {
        textContent: 'generation: 0'
    });

    const best = h('p', {
        textContent: 'best: ',
    }, {
        fontSize: '24px'
    });

    const onTick = () => {
        generation.textContent = `generation: ${deblurrer.getPopulation().getGeneration()}`;
        best.textContent = `best: ${deblurrer.getCurrentBest().string}`;
    };

    const deblurrer = new Deblurrer({
        populationSize: parseInt(populationSize.value()),
        target: text.value(),
        blurRadius: parseInt(blurRadius.value()),
        font: `${fontSize.value()}px sans-serif`,
        onTick
    });

    function onUpdate() {
        deblurrer.update({
            populationSize: parseInt(populationSize.value()),
            target: text.value(),
            blurRadius: parseInt(blurRadius.value()),
            font: `${fontSize.value()}px sans-serif`,
            onTick
        });

        deblurrer.tick();
        rerender();
    }

    const contexts = appendChildren(h('div', {}, {
        display: 'flex',
        flexWrap: 'wrap'
    }),
        deblurrer.getContexts().map(ctx => ctx.canvas)
    );

    const domElem = appendChildren(h('div'), [
        deblurrer.getTargetContext().canvas,
        text.elem,
        blurRadius.elem,
        fontSize.elem,
        populationSize.elem,
        generation,
        best,
        h('button', {
            textContent: 'start',
            onclick: () => {
                // deblurrer.reset();
                deblurrer.start();
            }
        }),
        contexts
    ]);

    const rerender = () => {
        console.log('rerender', deblurrer.getContexts().length);
        contexts.innerHTML = '';
        appendChildren(contexts,
            deblurrer.getContexts().map(ctx => ctx.canvas)
        );
    };

    onUpdate();

    return domElem;
};

const domElem = setup();
document.body.appendChild(domElem);