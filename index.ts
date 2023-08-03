import { tokenize } from "./lib/tokenise";
import { parse } from "./lib/parser";

const file = Bun.file("./input.eclisp");

const text = await file.text();
console.log(text);

const tokens = tokenize(text);
console.log(tokens);

const ast = parse(tokens);
console.log(ast);
