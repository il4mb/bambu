import { Container, createEvent, EventEmitter } from "@bambu/node";
import { createRef, RefObject } from "react";
import _ from 'lodash';

export type Device = {
    label: string;
    width: number | 'fluid';
    height: number | 'fluid';
};

export type Devices = {
    [K: string]: Device
}

export class ViewportController<D extends Devices = Devices> extends EventEmitter {

    private _activeId: keyof D & string;
    readonly devices: Map<keyof D & string, Device> = new Map();
    readonly screenRef: RefObject<HTMLDivElement> = createRef();

    constructor(
        protected container: Container,
        public initialDevices: D,
        protected initialKey?: keyof D & string
    ) {
        super();
        for (const key of Object.keys(initialDevices)) {
            this.devices.set(key, initialDevices[key]);
        }
        const ids = this.devices.keys();
        if (initialKey && Array.from(ids).includes(String(initialKey))) {
            this.setDevice(initialKey);
        } else {
            this.setDevice(ids[0]);
        }

    }


    setDevice(id: keyof D & string) {

        const prev = this.devices.has(this._activeId) ? this.devices.get(this._activeId) : null;
        const next = this.devices.has(id) ? this.devices.get(id) : null;
        if (_.isEqual(prev, next)) return;

        this._activeId = id;
        const event = createEvent({
            path: ["device"],
            value: next,
            prev: prev
        })
        this.emitWith("device", (listeners) => {
            for (const callback of listeners) {
                callback(event);
                if (event.isStopPropagation) break;
            }
        });
        if (!event.isDefaultPrevented) {
            this.container.emitWith("viewport:device", (listeners) => {
                for (const callback of listeners) {
                    callback(event);
                    if (event.isStopPropagation) break;
                }
            });
        }
    }

    get activeId() {
        return this._activeId;
    }

    get device() {
        return this.devices.get(this._activeId);
    }
}