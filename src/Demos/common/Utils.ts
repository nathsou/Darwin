
type WritableCSSDeclaration = Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule'>>;

export const h = <T extends keyof HTMLElementTagNameMap>(
    name: T,
    props: Partial<HTMLElementTagNameMap[T]> = {},
    style: WritableCSSDeclaration = {}
): HTMLElementTagNameMap[T] => {
    const element = document.createElement(name);

    for (const [prop, value] of Object.entries(props)) {
        element[prop as keyof HTMLElementTagNameMap[T]] = value;
    }

    for (const rule in style) {
        const value = style[rule];
        if (value !== undefined) {
            element.style[rule] = value;
        }
    }

    return element;
};

export const createCanvas = (
    props: Partial<HTMLCanvasElement> = {},
    style: WritableCSSDeclaration = {}
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
    const cnv = h('canvas', props, style);
    const ctx = cnv.getContext('2d');

    if (ctx === null) {
        throw new Error(`Could not create a 2d canvas`);
    }

    return [cnv, ctx];
};

export const appendChildren = <T extends HTMLElement>(target: T, chilren: ChildNode[]): T => {
    for (const child of chilren) {
        target.appendChild(child);
    }

    return target;
};

export const namedInput = (name: string, props: Partial<HTMLInputElement>) => {
    const input = h('input', props);
    const span = h('span', { textContent: props.type === 'range' ? `${name} : ${input.value}` : name });
    const div = appendChildren(h('div'), [span, input]);

    input.addEventListener('change', () => {
        if (props.type === 'range') {
            span.textContent = `${name} : ${input.value}`;
        }
    });

    return {
        elem: div,
        value: () => input.value
    };
};