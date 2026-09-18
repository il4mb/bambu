declare global {
    interface NodeObject {
        vars: {
            [key: string]: string
        },
        events: {
            [key: string]: string
        }
    }
}

export {};