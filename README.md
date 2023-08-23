# eclisp

A simple little lisp built with TypeScript.

[Web Playground](https://eclisp.vercel.app) Only Really works on desktop.

Fibonnaci sequence O(N) time complexity:

```
(defn fibDp (n) (
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

(for (let x 0) (<= x 50) (set x (+ x 1)) (
    (print (fibDp x))
))
```

## Use

To use this language it is reccomended that you use [Bun](https://bun.sh). It is a super fast and cool JavaScript and TypeScript runtime. You don't neccescarily have to use it as the core language is just TypeScript/JavaScript and web apis but the `index.ts` file has some native bun apis in it. If you don't want to install install bun or figure out how to build and run with your favorite JavaScript runtime such as Deno or Node just use the [web playground](https://eclisp.vercel.app).

Run .eclisp file:

```
bun run index.ts [PATH TO INPUT FILE]
```

Build for browser:

```
bun build browser.ts --outdir public
```

## Todo:

-   [x] Tokenizer
-   [x] Parser
-   [x] Eval
-   [x] Variables
-   [x] Edit Variables
-   [x] Floating Point Literals
-   [x] Booleans
-   [x] Functions
-   [x] While Loops
-   [x] For Loops
-   [x] Control Flow
-   [x] Better command line experience
-   [x] Fibonacci Sequence From Scratch
-   [ ] Quote
-   [x] Array
-   [x] setn
-   [ ] Array Methods; length, map, filter reduce, etc
-   [ ] Hashmap
-   [ ] make strings useful; actual string methods and such
-   [x] Web Playground
-   [x] Make web playground pretty and nice to look at
-   [ ] More Builtin Operators/Functions; ^, sqrt, floor, ceil, round, input, etc.
-   [ ] Gigantic Refactor because the code is terrible
-   [ ] Better Type Safety/TypeScript Typings, kinda part of refactor
-   [ ] Error Handling, Currently errors just silently happen
-   [ ] Proper Value Type so every time I make a change I don't have to update it throughout my code base
-   [ ] Documentation
-   [x] repl
