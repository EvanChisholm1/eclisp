import { AST } from "./parser";
import { Value } from "./value";

export default interface StackFrame {
    vars: {
        [key: string]: Value;
    };
    funcs: {
        [key: string]: {
            ast: AST;
            paramIds: Array<string>;
        };
    };
}
