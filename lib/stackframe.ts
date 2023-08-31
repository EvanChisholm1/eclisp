import { Token } from "./tokenise";
import { AST } from "./parser";

export default interface StackFrame {
    vars: {
        [key: string]: {
            value: string | boolean | number | Array<any>;
            type: Token;
        };
    };
    funcs: {
        [key: string]: {
            ast: AST;
            paramIds: Array<string>;
        };
    };
}
