import { tokenize } from "./lib/tokenise";
import { parse } from "./lib/parser";
import { evaluate } from "./lib/eval";
import { repl } from "./lib/repl";

if (Bun.argv[2]) {
    const file = Bun.file(Bun.argv[2]);

    const text = await file.text();
    const tokens = tokenize(text);
    const ast = parse(tokens);

    evaluate(ast);
} else {
    repl();
}
