"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Similar to Option<T> in Rust
class Option {
    constructor(val) {
        this._available = false;
        if (val !== undefined) {
            this.set(val);
        }
    }
    set(new_val) {
        this._value = new_val;
        this._available = true;
    }
    empty() {
        this._available = false;
        this._value = undefined;
    }
    get value() {
        if (this._available) {
            return this._value;
        }
        throw new Error(`Cannot acces value of empty Option, please check Option<T>.available`);
    }
    set value(new_val) {
        this.set(new_val);
    }
    get available() {
        return this._available;
    }
}
exports.Option = Option;
