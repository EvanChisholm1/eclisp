import { tokenize } from "./lib/tokenise";
import { parse } from "./lib/parser";
import { evaluate } from "./lib/eval";

const file = Bun.file("./input.eclisp");

const text = await file.text();
console.log(text);

const tokens = tokenize(text);
console.log(tokens);

const ast = parse(tokens);
console.log(ast);

evaluate(ast);
console.log(1.0);
