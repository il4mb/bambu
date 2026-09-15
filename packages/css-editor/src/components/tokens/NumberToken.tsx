import NumberField from "../fields/NumberField";
import { useTokenContext } from "../TokenNode";

const cleanTrailingZero = (num?: string) => num?.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

export interface NumberTokenProps {
    token: IToken;
    value?: string;
}

export default function NumberToken({ token, value }: NumberTokenProps) {
    const { setValue } = useTokenContext();

    const handleNumberChange = (number: string) => {
        const nextValue = `${cleanTrailingZero(number)}`;
        setValue(nextValue);
    };

    return (
        <span data-start={token[1]} data-end={token[2]}>
            <NumberField value={String(value ?? "")} onChange={handleNumberChange} />
        </span>
    );
}
