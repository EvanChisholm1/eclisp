import { evaluate } from "./lib/eval";
import { tokenize } from "./lib/tokenise";
import { parse } from "./lib/parser";

console.log("Click the run button to run your eclisp program. :)");
const defaultInput = `(defn fibDp (n) (
    (if (= n 0) (
        0
    ) (if (= n 1) (
        1
    ) (
        (let a 0)
        (let b 1)
        (let i 2)
        (while (<= i n) (
            (let temp b)
            (set b (+ a b))
            (set a temp)
            (set i (+ i 1))
        ))
        (b)
    )))
))

(for (let i 0) (<= i 100) (set i (+ i 1)) (
    (print (fibDp i))
))
`;

const textBox = document.querySelector("textarea");
textBox.value = defaultInput;
function run() {
    console.log("---RUNNING ECLISP PROGRAM---");
    const tokens = tokenize(textBox.value);
    const ast = parse(tokens);
    evaluate(ast);
    console.log("---DONE RUNNING ECLISP PROGRAM---");
}

const form = document.querySelector("form");
form.addEventListener("submit", e => {
    e.preventDefault();
    run();
});
