import { tokenize } from "./lib/tokenise";

const file = Bun.file("./input.eclisp");

const text = await file.text();
console.log(text);

const tokens = tokenize(text);

console.log(tokens);
