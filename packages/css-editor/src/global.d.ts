declare global {
    interface HTMLElement {
        nodeOffset: {
            start: {
                offset: number;
                line: number;
                column: number;
            }
            end: {
                offset: number;
                line: number;
                column: number;
            }
        }
    }

    type IToken = [type: string, start: number, end: number];

    export interface TokenPlain {
        id: string;
        type: string;
        value: string;
        start: number;
        end: number;
        number?: number;
        unit?: string;
        children?: TokenPlain[]
    }

    export type ColorOptions = {
        indicator?: {
            background?: string;
            color?: string;
        };
    }
}

export { };