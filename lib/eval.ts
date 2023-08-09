import { AST } from "./parser";
import { Token } from "./tokenise";

interface StackFrame {
    vars: {
        [key: string]: { value: string | boolean | number; type: Token };
    };
    funcs: {
        [key: string]: {
            ast: AST;
            paramIds: Array<string>;
        };
    };
}

function funcDef(ast: AST, state: Array<StackFrame>) {
    // ast value 0: defn
    // ast value 1: id
    // ast value 2: params list (a b c)
    // ast value 3: ast
    if (!Array.isArray(ast)) return { value: false, type: Token.Bool };
    if (Array.isArray(ast[1])) return { value: false, type: Token.Bool };
    if (!Array.isArray(ast[2])) return { value: false, type: Token.Bool };
    if (!Array.isArray(ast[3])) return { value: false, type: Token.Bool };

    const funcName = ast[1]!.value as string;
    const func: {
        ast: AST;
        paramIds: Array<string>;
    } = {
        paramIds: ast[2].map(x => (x as any).value as string),
        ast: ast[3],
    };

    state.at(-1)!.funcs[funcName] = func;

    return { value: true, type: Token.Bool };
}

function runFunc(
    id: string,
    params: Array<{ value: string | boolean | number; type: Token }>,
    state: Array<StackFrame>
) {
    const vars: {
        [key: string]: { value: string | boolean | number; type: Token };
    } = {};
    const funcs: {
        [key: string]: {
            ast: AST;
            paramIds: Array<string>;
        };
    } = {};

    for (const frame of state) {
        for (const [key, value] of Object.entries(frame.vars)) {
            vars[key] = value;
        }

        for (const [key, value] of Object.entries(frame.funcs)) {
            funcs[key] = value;
        }
    }

    const defintion = funcs[id]!;
    defintion.paramIds.forEach((x, i) => {
        state[state.length - 1].vars[x] = params[i];
    });

    return evaluate(defintion.ast, state);
}

function evalIf(ast: AST, state: Array<StackFrame>) {
    const condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];
    let returnVal;

    if (condition.value) {
        returnVal = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
    } else if (ast[3]) {
        returnVal = Array.isArray(ast[3]) ? evaluate(ast[3], state) : ast[3];
    } else {
        returnVal = { value: false, type: Token.Bool };
    }

    state.pop();

    return returnVal;
}

function evalSet(
    id: string,
    newValue: {
        value: string | number | boolean;
        type: Token;
    },
    state: Array<StackFrame>
) {
    for (let i = state.length - 1; i >= 0; i--) {
        if (state[i].vars[id]) {
            state[i].vars[id] = newValue;
            return newValue;
        }
    }

    state.pop();
    return { type: Token.Bool, value: false };
}

export function evaluate(
    ast: AST,
    state: Array<StackFrame> = []
): {
    value: string | number | boolean;
    type: Token;
} {
    state.push({ vars: {}, funcs: {} });
    const vars: {
        [key: string]: { value: string | boolean | number; type: Token };
    } = {};
    const funcs: {
        [key: string]: {
            ast: AST;
            paramIds: Array<string>;
        };
    } = {};

    if (
        !Array.isArray(ast[0]) &&
        ast[0].type === Token.Id &&
        ast[0].value === "if"
    ) {
        return evalIf(ast, state);
    }

    if (
        !Array.isArray(ast[0]) &&
        ast[0].type === Token.Id &&
        ast[0].value === "defn"
    ) {
        return funcDef(ast, state);
    }

    if (
        !Array.isArray(ast[0]) &&
        ast[0].type === Token.Id &&
        !Array.isArray(ast[1]) &&
        !Array.isArray(ast[2]) &&
        ast[0].value === "set"
    ) {
        return evalSet(ast[1].value as string, ast[2], state);
    }

    for (const frame of state) {
        for (const [key, value] of Object.entries(frame.vars)) {
            vars[key] = value;
        }

        for (const [key, value] of Object.entries(frame.funcs)) {
            funcs[key] = value;
        }
    }

    const res = ast
        .map(x => (Array.isArray(x) ? evaluate(x, state) : x))
        .map(x =>
            vars[x.value as string] !== undefined ? vars[x.value as string] : x
        );
    const first = res[0];

    let returnVal: { type: Token; value: string | boolean | number } =
        res.at(-1)!;

    if (first.type === Token.Id) {
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

        if (first.value === "not") {
            returnVal = {
                type: Token.Bool,
                value: !(res[1].value as any),
            };
        }

        if (
            Object.entries(funcs)
                .map(([key]) => key)
                .includes(first.value as string)
        ) {
            returnVal = runFunc(first.value as string, res.slice(1), state);
        }
    }

    state.pop();
    return returnVal;
}
