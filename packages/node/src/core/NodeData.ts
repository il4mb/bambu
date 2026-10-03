import Observable from "./Observable";

const TYPE_DATA = ["string", "number", "object", "boolean", "array", "unknown", "binding"] as const;
type TypeName = typeof TYPE_DATA[number];
type Descriptor = {
    name: string;
    value: any;
    type: TypeName;
    
}
type TNodeData = {
    [K: string]: Descriptor
}

export default class NodeData extends Observable<TNodeData> {
    // 1. Allow TypeScript to recognize dynamic dot-notation properties
    [key: string]: any; 
    
    protected state: TNodeData;

    constructor(initial: Record<string, any>) {
        super();
        this.state = Object.fromEntries(Object.entries(initial).map(([key, value]) => {
            return [key, this.createItem(key, value)];
        })) as TNodeData;

        return new Proxy(this, {
            get: (target, prop) => {
                // Check if the property exists on the class/EventTarget
                if (prop in target) {
                    const value = Reflect.get(target, prop);
                    if (typeof value === 'function') {
                        // @ts-ignore
                        return value.bind(target);
                    }
                    return value;
                }

                // Extract the actual value from the descriptor
                if (typeof prop === "string" && target.state[prop]) {
                    return target.state[prop].value;
                }
                
                return undefined;
            },
            set: (target, prop, value) => {
                // Do not intercept native properties or methods
                if (prop in target) {
                    return Reflect.set(target, prop, value);
                }

                if (typeof prop === "string") {
                    const existingItem = target.state[prop];
                    if (existingItem && existingItem.type === "binding") {
                        return true;
                    }

                    // Create new descriptor and push through Observable
                    const newDescriptor = target.createItem(prop, value);
                    target.set(prop, newDescriptor);
                    
                    return true;
                }
                
                return false;
            }
        });
    }

    createItem(name: string, value: any): Descriptor {
        let type: TypeName = "unknown";
        
        // 7. Fix JS typeof quirk: typeof [] is "object"
        if (Array.isArray(value)) {
            type = "array";
        } else if (TYPE_DATA.includes(typeof value as any)) {
            type = typeof value as TypeName;
        }

        return { name, value, type };
    }
}

// // --- TEST EXECUTIONS ---
// const data = new NodeData({ text: "Hallo World" });

// // Watch for changes!
// data.on("change", (e: any) => {
//     console.log(`Global Change => Changed ${e.detail.property} to:`, e.detail.newValue.value);
// });

// data.on("change:text", (e: any) => {
//     console.log("Text Specific Change =>", e.detail.newValue.value);
// });

// console.log("Initial:", data.text);

// // This will now successfully trigger the Observable.set() method
// data.text = "Hallo 2 World";