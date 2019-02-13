"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        // This Map is often unused, it is therfore best to initialize it only when needed
        // i.e  when the on() method is called for the first time
        // this.handlers = new Map<string, EventHandler[]>();
    }
    on(ev, handler) {
        if (this.handlers === undefined) {
            this.handlers = new Map();
        }
        if (this.handlers.has(ev)) {
            this.handlers.get(ev).push(handler);
        }
        else {
            this.handlers.set(ev, [handler]);
        }
    }
    emit(ev, value) {
        if (this.handlers !== undefined && this.handlers.has(ev)) {
            for (const handler of this.handlers.get(ev)) {
                handler.call(this, value);
            }
        }
    }
    bindEvent(em, ev) {
        em.on(ev, value => this.emit(ev, value));
    }
}
exports.EventEmitter = EventEmitter;
