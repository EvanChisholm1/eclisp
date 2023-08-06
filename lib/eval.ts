import { stat } from "fs";
import { AST } from "./parser";
import { Token } from "./tokenise";

interface StackFrame {
    vars: {
        [key: string]: { value: string | boolean | number; type: Token };
    };
}

export function evaluate(
    ast: AST,
    state: Array<StackFrame> = []
): {
    value: string | number | boolean;
    type: Token;
} {
    state.push({ vars: {} });
    const vars: {
        [key: string]: { value: string | boolean | number; type: Token };
    } = {};

    for (const frame of state) {
        for (const [key, value] of Object.entries(frame.vars)) {
            // console.log("KEY AND VALUE", key, value);
            vars[key] = value;
        }
    }
    // console.log(vars);

    // console.log("evaluating", ast);
    const res = ast
        .map(x => (Array.isArray(x) ? evaluate(x, state) : x))
        .map(x =>
            vars[x.value as string] !== undefined ? vars[x.value as string] : x
        );
    // console.log(state);
    const first = res[0];

    let returnVal: { type: Token; value: string | boolean | number } = {
        type: Token.WhiteSpace,
        value: " ",
    };

    if (first.type === Token.Id) {
        // console.log(state);
        if (first.value === "print") {
            const str = res
                .slice(1)
                .map(x => x.value)
                .join(" ");
            console.log(str);
            returnVal = {
                type: Token.String,
                value: str,
            };
        }

        if (first.value === "let") {
            state.at(-2)!.vars[res[1].value as string] = res[2];
            returnVal = {
                type: res[2].type,
                value: res[2].value,
            };
        }

        if (first.value === "/") {
            returnVal = {
                type: Token.Number,
                value: (res[1].value as number) / (res[2].value as number),
            };
        }

        if (first.value === "*") {
            returnVal = {
                type: Token.Number,
                value: (res[1].value as number) * (res[2].value as number),
            };
        }

        if (first.value === "+") {
            // console.log(state);
            returnVal = {
                type: Token.Number,
                value: (res[1].value as number) + (res[2].value as number),
            };
        }

        if (first.value === "-") {
            returnVal = {
                type: Token.Number,
                value: (res[1].value as number) - (res[2].value as number),
            };
        }

        if (first.value === ">") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as number) > (res[2].value as number),
            };
        }

        if (first.value === ">=") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as number) >= (res[2].value as number),
            };
        }

        if (first.value === "<") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as number) < (res[2].value as number),
            };
        }

        if (first.value === "<=") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as number) <= (res[2].value as number),
            };
        }

        if (first.value === "=") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as any) === (res[2].value as any),
            };
        }
    }

    state.pop();
    return returnVal;
}
