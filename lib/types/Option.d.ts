export declare class Option<T> {
    private _value;
    private _available;
    constructor(val?: T);
    set(new_val: T): void;
    empty(): void;
    value: T | never;
    readonly available: boolean;
}
