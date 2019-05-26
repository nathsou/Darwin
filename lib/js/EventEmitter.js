"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        this.event_handlers = new Map();
    }
    on(ev, handler) {
        if (!this.isListening(ev)) {
            this.event_handlers.set(ev, []);
        }
        this.event_handlers.get(ev).push(handler);
    }
    isListening(ev) {
        return this.event_handlers.has(ev);
    }
    emit(ev, value, thisArg) {
        if (this.isListening(ev)) {
            for (const handler of this.event_handlers.get(ev)) {
                handler.call(thisArg, value);
            }
        }
    }
    bindEvent(em, ev) {
        em.on(ev, value => this.emit(ev, value));
    }
    removeListener(ev) {
        this.event_handlers.delete(ev);
    }
    removeListeners() {
        this.event_handlers.clear();
    }
}
exports.default = EventEmitter;
