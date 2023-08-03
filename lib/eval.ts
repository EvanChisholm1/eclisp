import { AST } from "./parser";
import { Token } from "./tokenise";

export function evaluate(ast: AST): {
    value: string | number;
    type: Token;
} {
    // console.log("evaluating", ast);
    const res = ast.map(x => (Array.isArray(x) ? evaluate(x) : x));
    const first = res[0];
    if (first.type === Token.Id) {
        if (first.value === "print") {
            const str = res
                .slice(1)
                .map(x => x.value)
                .join(" ");
            console.log(str);
            return {
                type: Token.String,
                value: str,
            };
        }

        if (first.value === "/") {
            return {
                type: Token.Number,
                value: (res[1].value as number) / (res[2].value as number),
            };
        }

        if (first.value === "*") {
            return {
                type: Token.Number,
                value: (res[1].value as number) * (res[2].value as number),
            };
        }

        if (first.value === "+") {
            return {
                type: Token.Number,
                value: (res[1].value as number) + (res[2].value as number),
            };
        }

        if (first.value === "-") {
            return {
                type: Token.Number,
                value: (res[1].value as number) - (res[2].value as number),
            };
        }
    }

    return { type: Token.WhiteSpace, value: " " };
}
