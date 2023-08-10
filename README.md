# eclisp

A simple little lisp built with TypeScript.

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
```

## Todo:

-   [x] Tokenizer
-   [x] Parser
-   [ ] Eval
-   [x] Variables
-   [x] Edit Variables
-   [x] Floating Point Literals
-   [x] Booleans
-   [x] Functions
-   [x] While Loops
-   [ ] For Loops
-   [x] Control Flow
-   [ ] Better command line experience
-   [x] Fibonacci Sequence From Scratch
-   [ ] Quote
-   [ ] Array
-   [ ] Hashmap
