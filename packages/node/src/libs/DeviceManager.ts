import { EventEmitter } from "../core";
import { createRef, RefObject } from "react";
import _ from 'lodash';
import { CreateEventMap, EventDetail } from "../types";
import Container from "../Container";

export type Device = {
    label: string;
    width: number | 'fluid';
    height: number | 'fluid';
};

export type Devices = {
    [K: string]: Device
};

// Interface designed for module augmentation (allows users to inject custom devices globally)
export interface OverridableDevices extends Devices { }

export const DEFAULT_DEVICES = {
    desktop: {
        label: "Desktop",
        width: 1440,
        height: 900,
    },
    tablet: {
        label: "Tablet",
        width: 768,
        height: 1024,
    },
    mobile: {
        label: "Mobile",
        width: 375,
        height: 812,
    },
} as const;

// Changed `&` to `|` so it correctly unions default keys with any overridden keys
export type DeviceName = keyof typeof DEFAULT_DEVICES | keyof OverridableDevices;


type Events = CreateEventMap<"change" | "device:change">;

export class DeviceManager extends EventEmitter<Events> {

    private _activeId: DeviceName | null = 'tablet';
    private readonly _devices: Map<string, Device> = new Map(Object.entries(DEFAULT_DEVICES));
    readonly screenRef: RefObject<HTMLDivElement | null> = createRef();

    constructor(protected container: Container) {
        super();
    }

    public get activeId(): DeviceName | null {
        return this._activeId;
    }

    public get device(): Device | undefined {
        return this._devices.get(this._activeId as string);
    }

    public all() {
        return Array.from(this._devices);
    }

    public add(name: DeviceName, device: Device) {
        this._devices.set(String(name), device);
    }

    public delete(name: DeviceName) {
        if (this._devices.has(String(name))) {
            this._devices.delete(String(name));
            if (this._activeId === name) {
                if (Array.from(this._devices.keys())[0]) {
                    this.setDevice(Array.from(this._devices.keys())[0] as DeviceName);
                } else {
                    this.setDevice(null);
                }
            }
        }
    }

    public setDevice(id: DeviceName | null) {
        const prev = this._devices.get(this._activeId as string) ?? null;
        const next = this._devices.get(id as string) ?? null;
        if (_.isEqual(prev, next)) return;

        this._activeId = id;
        this.firePropertyChange("activeId", next, prev);
    }

    /**
     * Map over all registered devices
     */
    public map<U>(callbackfn: (value: Device, index: number, array: Device[]) => U): U[] {
        return Array.from(this._devices.values()).map(callbackfn);
    }

    /**
     * Filter registered devices
     */
    public filter(predicate: (value: Device, index: number, array: Device[]) => boolean): Device[] {
        return Array.from(this._devices.values()).filter(predicate);
    }

    /**
     * Iterate over registered devices
     */
    public forEach(callbackfn: (value: Device, index: number, array: Device[]) => void): void {
        Array.from(this._devices.values()).forEach(callbackfn);
    }

    /**
     * Find a specific device based on a condition
     */
    public find(predicate: (value: Device, index: number, array: Device[]) => boolean): Device | undefined {
        return Array.from(this._devices.values()).find(predicate);
    }

    /**
     * Helper to wrap property change firing logic
     */
    private firePropertyChange(property: string, newValue: any, oldValue: any) {
        this.fire(["device:change", "change"], {
            target: this,
            // @ts-ignore
            property,
            newValue,
            oldValue
        });
    }

    /**
     * Override fire to propagate events up to the container
     */
    public fire<K extends string, T extends object = object, V = any>(
        events: K | K[],
        detail: EventDetail<T, V>
    ): void {
        super.fire(events, detail);
        // Bubble the event to the container level
        // @ts-ignore - Assuming Container has a compatible fire method signature
        this.container.fire(events, detail);
    }
}