import { evaluate } from "./eval";
import StackFrame from "./stackframe";
import { parse } from "./parser";
import { Token, tokenize } from "./tokenise";

function doneExpression(text: string) {
    const parens: string[] = [];
    for (const char of text.split("")) {
        if (char === "(") parens.push(char);
        else if (char === ")") parens.pop();
    }

    if (parens.length > 0) return false;
    return true;
}

function read() {
    let textData = "";

    do {
        const newText = prompt(textData.length > 0 ? "..." : ">");
        textData = `${textData}\n${newText}`;
    } while (!doneExpression(textData));

    return textData;
}
const state: StackFrame[] = [
    {
        vars: {},
        funcs: {},
    },
];

export function repl() {
    console.log("Welcome to the eclisp repl start typing to begin.\n");
    while (true) {
        evaluate([
            { type: Token.Id, value: "print" },
            evaluate(parse(tokenize(read())), state, false, false),
        ]);
    }
}
