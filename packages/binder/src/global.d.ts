declare global {
    interface NodeObjectData {
        vars: {
            [key: string]: string
        }
    }
}