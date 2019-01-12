
// Similar to Option<T> in Rust
export class Option<T> {
    private _value: T;
    private _available = false;

    constructor(val?: T) {
        if (val !== undefined) {
            this.set(val);
        }
    }

    public set(new_val: T): void {
        this._value = new_val;
        this._available = true;
    }

    public empty(): void {
        this._available = false;
        this._value = undefined;
    }

    public get value(): T | never {
        if (this._available) {
            return this._value;
        }

        throw new Error(`Cannot acces value of empty Option, please check Option<T>.available`);
    }

    public set value(new_val: T) {
        this.set(new_val);
    }

    public get available(): boolean {
        return this._available;
    }
}