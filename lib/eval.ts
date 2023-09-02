import { AST } from "./parser";
import { Token } from "./tokenise";
import StackFrame from "./stackframe";
import getCurrentState from "./getCurrentState";
import { Value } from "./value";

function funcDef(ast: AST, state: Array<StackFrame>): Value {
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

    state.at(-2)!.funcs[funcName] = func;
    state.pop();

    return { value: funcName, type: Token.Id };
}

function runFunc(id: string, params: Array<Value>, state: Array<StackFrame>) {
    const { funcs } = getCurrentState(state);
    const defintion = funcs[id]!;
    defintion.paramIds.forEach((x, i) => {
        state[state.length - 1].vars[x] = params[i];
    });

    const returnVal = evaluate(defintion.ast, state);
    return returnVal;
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

function evalWhile(ast: AST, state: Array<StackFrame>) {
    let condition;
    condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];

    let returnVal: Value = { type: Token.Bool, value: false };
    while (condition.value) {
        if (condition.value) {
            returnVal = Array.isArray(ast[2])
                ? evaluate(ast[2], state)
                : ast[2];
        }
        condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];
    }
    state.pop();

    return returnVal;
}

function evalFor(ast: AST, state: Array<StackFrame>) {
    evaluate(ast[1] as any, state);
    let condition;
    condition = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];

    let returnVal: Value = { type: Token.Bool, value: false };
    while (condition.value) {
        if (condition.value) {
            returnVal = Array.isArray(ast[4])
                ? evaluate(ast[4], state)
                : ast[4];
        }
        evaluate(ast[3] as any, state);
        condition = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
    }
    state.pop();

    return returnVal;
}

function evalSet(
    id: string,
    newValue: AST | Value,
    state: Array<StackFrame>
): Value {
    const { vars } = getCurrentState(state);

    let setValue = Array.isArray(newValue)
        ? evaluate(newValue, state)
        : newValue;

    if (
        setValue.type === Token.Id &&
        vars[setValue.value as string] !== undefined
    ) {
        setValue = vars[setValue.value as string];
    }

    for (let i = state.length - 1; i >= 0; i--) {
        if (state[i].vars[id] !== undefined && state[i].vars[id] !== null) {
            state[i].vars[id] = setValue;
        }
    }

    state.pop();
    return setValue;
}

function evalLet(
    id: string,
    newValue: AST | Value,
    state: Array<StackFrame>
): Value {
    const { vars } = getCurrentState(state);

    let setValue = Array.isArray(newValue)
        ? evaluate(newValue, state)
        : newValue;

    if (
        setValue.type === Token.Id &&
        vars[setValue.value as string] !== undefined
    ) {
        setValue = vars[setValue.value as string];
    }

    state.at(-2)!.vars[id] = setValue;

    state.pop();
    return setValue;
}

export function evaluate(
    ast: AST,
    state: Array<StackFrame> = [],
    shouldPop: boolean = true,
    shouldPush: boolean = true
): Value {
    if (shouldPush) state.push({ vars: {}, funcs: {} });

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
        ast[0].value === "while"
    ) {
        return evalWhile(ast, state);
    }

    if (
        !Array.isArray(ast[0]) &&
        ast[0].type === Token.Id &&
        ast[0].value === "for"
    ) {
        return evalFor(ast, state);
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
        ast[0].value === "set"
    ) {
        return evalSet(ast[1].value as string, ast[2], state);
    }

    if (
        !Array.isArray(ast[0]) &&
        ast[0].type === Token.Id &&
        !Array.isArray(ast[1]) &&
        ast[0].value === "let"
    ) {
        return evalLet(ast[1].value as string, ast[2], state);
    }

    const { vars, funcs } = getCurrentState(state);

    const res = ast
        .map(x => (Array.isArray(x) ? evaluate(x, state) : x))
        .map(x =>
            vars[x.value as string] !== undefined ? vars[x.value as string] : x
        );
    const first = res[0];

    let returnVal: Value = res.at(-1)!;

    if (first.type === Token.Id) {
        if (first.value === "print") {
            const str = res
                .slice(1)
                .map(x =>
                    Array.isArray(x.value)
                        ? x.value.map(i => i.value).join(" ")
                        : x.value
                )
                .join(" ");
            console.log(str);
            returnVal = {
                type: Token.String,
                value: str,
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

        if (first.value === "^") {
            returnVal = {
                type: Token.Number,
                value: Math.pow(res[1].value as number, res[2].value as number),
            };
        }

        if (first.value === "sqrt") {
            returnVal = {
                type: Token.Number,
                value: Math.sqrt(res[1].value as number),
            };
        }

        if (first.value === "round") {
            returnVal = {
                type: Token.Number,
                value: Math.round(res[1].value as number),
            };
        }

        if (first.value === "ceil") {
            returnVal = {
                type: Token.Number,
                value: Math.ceil(res[1].value as number),
            };
        }

        if (first.value === "floor") {
            returnVal = {
                type: Token.Number,
                value: Math.floor(res[1].value as number),
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

        if (first.value === "or") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as any) || (res[2].value as any),
            };
        }

        if (first.value === "and") {
            returnVal = {
                type: Token.Bool,
                value: (res[1].value as any) && (res[2].value as any),
            };
        }

        if (first.value === "not") {
            returnVal = {
                type: Token.Bool,
                value: !(res[1].value as any),
            };
        }

        if (first.value === "list") {
            returnVal = {
                type: Token.List,
                value: res.slice(1),
            };
        }

        if (first.value === "nth") {
            if (!Array.isArray(res[2].value))
                throw new Error("not accessing an array");
            returnVal = res[2].value.at(res[1].value as number);
        }

        if (first.value === "setnth") {
            if (!Array.isArray(res[2].value))
                throw new Error("not accessing an array");
            res[2].value[res[1].value as number] = res[3];
            return res[3];
        }

        if (first.value === "join") {
            returnVal = {
                type: Token.List,
                value: res.slice(1).flatMap(x => x.value),
            };
        }

        if (first.value === "length") {
            returnVal = {
                type: Token.Number,
                value: (res.at(1)?.value as any).length,
            };
        }

        if (first.value === "push") {
            (res[2].value as any).push(res[1]);
            returnVal = {
                type: Token.List,
                value: res.at(2)!.value,
            };
        }

        if (first.value === "rand") {
            returnVal = {
                type: Token.Number,
                value: Math.random(),
            };
        }

        if (first.value === "map") {
            returnVal = {
                type: Token.List,
                value: (res[2].value as Array<any>).map((v, i) =>
                    runFunc(res[1].value as string, [v, i], state)
                ),
            };
        }

        if (first.value === "filter") {
            returnVal = {
                type: Token.List,
                value: (res[2].value as Array<any>).filter(
                    (v, i) =>
                        runFunc(res[1].value as string, [v, i], state).value
                ),
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

    if (shouldPop) state.pop();
    return returnVal;
}
