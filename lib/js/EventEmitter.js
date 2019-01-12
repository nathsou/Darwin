"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        this.handlers = new Map();
    }
    on(ev, handler) {
        if (this.handlers.has(ev)) {
            this.handlers.get(ev).push(handler);
        }
        else {
            this.handlers.set(ev, [handler]);
        }
    }
    emit(ev, value) {
        if (this.handlers.has(ev)) {
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
