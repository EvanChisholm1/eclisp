# eclisp

A simple little lisp built with TypeScript.

[Web Playground](https://eclisp.vercel.app), Very Ugly but super simple to use.

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
-   [ ] Array
-   [ ] Hashmap
-   [ ] Web Playground
-   [ ] More Builtin Operators/Functions; ^, sqrt, floor, ceil, round, input, etc.
-   [ ] Gigantic Refactor because the code is terrible
-   [ ] Better Type Safety/TypeScript Typings, kinda part of refactor
-   [ ] Error Handling, Currently errors just silently happen
-   [ ] Proper Value Type so every time I make a change I don't have to update it throughout my code base
