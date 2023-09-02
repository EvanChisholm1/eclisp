import { Token } from "./tokenise";

export type PrimitiveValue = number | string | boolean;

export interface Value {
    type: Token;
    value: PrimitiveValue | Array<Value>;
}
