// lib/tokenise.ts
function tokenize(input) {
  const inputStream = input.trim().split("");
  const tokens = [{ type: Token.WhiteSpace, value: " " }];
  while (inputStream.length > 0) {
    const currentChar = inputStream.splice(0, 1)[0];
    const next = tokens.length > 1 ? tokens[1] : "";
    const prevTok = tokens[tokens.length - 1];
    if (currentChar === "(") {
      tokens.push({ type: Token.OpenParen, value: currentChar });
    } else if (currentChar === ")") {
      tokens.push({ type: Token.CloseParen, value: currentChar });
    } else if (numbers.includes(currentChar)) {
      if (prevTok.type === "number") {
        prevTok.value = prevTok.value.concat(currentChar);
      } else
        tokens.push({ type: Token.Number, value: currentChar });
    } else if (currentChar === "." && prevTok.type === Token.Number) {
      prevTok.value = prevTok.value.concat(currentChar);
    } else if (currentChar === " " || currentChar === "\n") {
      if (prevTok.type === Token.WhiteSpace)
        continue;
      tokens.push({ type: Token.WhiteSpace, value: " " });
    } else if (currentChar === '"') {
      let string = ['"'];
      let strC = "";
      do {
        strC = inputStream.splice(0, 1)[0];
        string.push(strC);
      } while (strC !== '"');
      tokens.push({ type: Token.String, value: string.join("") });
    } else {
      const id = [currentChar];
      while (inputStream[0] !== " " && inputStream[0] !== "\n" && inputStream[0] !== ")" && inputStream[0] !== "(") {
        const cur = inputStream.splice(0, 1)[0];
        id.push(cur);
      }
      tokens.push({ type: Token.Id, value: id.join("") });
    }
  }
  for (const tok of tokens) {
    if (tok.type === Token.Id && (tok.value === "true" || tok.value === "false")) {
      tok.type = Token.Bool;
    }
  }
  return tokens;
}
var Token;
(function(Token2) {
  Token2["Number"] = "number";
  Token2["String"] = "string";
  Token2["OpenParen"] = "openParen";
  Token2["CloseParen"] = "closeParen";
  Token2["Id"] = "id";
  Token2["WhiteSpace"] = "whitespace";
  Token2["Bool"] = "bool";
  Token2["List"] = "list";
})(Token || (Token = {}));
var numbers = new Array(10).fill(0).map((_, i) => i.toString());

// lib/eval.ts
var funcDef = function(ast, state) {
  if (!Array.isArray(ast))
    return { value: false, type: Token.Bool };
  if (Array.isArray(ast[1]))
    return { value: false, type: Token.Bool };
  if (!Array.isArray(ast[2]))
    return { value: false, type: Token.Bool };
  if (!Array.isArray(ast[3]))
    return { value: false, type: Token.Bool };
  const funcName = ast[1].value;
  const func = {
    paramIds: ast[2].map((x) => x.value),
    ast: ast[3]
  };
  state.at(-2).funcs[funcName] = func;
  state.pop();
  return { value: true, type: Token.Bool };
};
var runFunc = function(id, params, state) {
  const vars = {};
  const funcs = {};
  for (const frame of state) {
    for (const [key, value] of Object.entries(frame.vars)) {
      vars[key] = value;
    }
    for (const [key, value] of Object.entries(frame.funcs)) {
      funcs[key] = value;
    }
  }
  const defintion = funcs[id];
  defintion.paramIds.forEach((x, i) => {
    state[state.length - 1].vars[x] = params[i];
  });
  const returnVal = evaluate(defintion.ast, state);
  return returnVal;
};
var evalIf = function(ast, state) {
  const condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];
  let returnVal;
  if (condition.value) {
    returnVal = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
  } else if (ast[3]) {
    returnVal = Array.isArray(ast[3]) ? evaluate(ast[3], state) : ast[3];
  } else {
    returnVal = { value: false, type: Token.Bool };
  }
  state.pop();
  return returnVal;
};
var evalWhile = function(ast, state) {
  let condition;
  condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];
  let returnVal = { type: Token.Bool, value: false };
  while (condition.value) {
    if (condition.value) {
      returnVal = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
    }
    condition = Array.isArray(ast[1]) ? evaluate(ast[1], state) : ast[1];
  }
  state.pop();
  return returnVal;
};
var evalFor = function(ast, state) {
  evaluate(ast[1], state);
  let condition;
  condition = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
  let returnVal = { type: Token.Bool, value: false };
  while (condition.value) {
    if (condition.value) {
      returnVal = Array.isArray(ast[4]) ? evaluate(ast[4], state) : ast[4];
    }
    evaluate(ast[3], state);
    condition = Array.isArray(ast[2]) ? evaluate(ast[2], state) : ast[2];
  }
  state.pop();
  return returnVal;
};
var evalSet = function(id, newValue, state) {
  const vars = {};
  for (const frame of state) {
    for (const [key, value] of Object.entries(frame.vars)) {
      vars[key] = value;
    }
  }
  let setValue = Array.isArray(newValue) ? evaluate(newValue, state) : newValue;
  if (setValue.type === Token.Id && vars[setValue.value] !== undefined) {
    setValue = vars[setValue.value];
  }
  for (let i = state.length - 1;i >= 0; i--) {
    if (state[i].vars[id] !== undefined && state[i].vars[id] !== null) {
      state[i].vars[id] = setValue;
    }
  }
  state.pop();
  return { type: Token.Bool, value: false };
};
var evalLet = function(id, newValue, state) {
  const vars = {};
  for (const frame of state) {
    for (const [key, value] of Object.entries(frame.vars)) {
      vars[key] = value;
    }
  }
  let setValue = Array.isArray(newValue) ? evaluate(newValue, state) : newValue;
  if (setValue.type === Token.Id && vars[setValue.value] !== undefined) {
    setValue = vars[setValue.value];
  }
  state.at(-2).vars[id] = setValue;
  state.pop();
  return { type: Token.Bool, value: false };
};
function evaluate(ast, state = []) {
  state.push({ vars: {}, funcs: {} });
  const vars = {};
  const funcs = {};
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && ast[0].value === "if") {
    return evalIf(ast, state);
  }
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && ast[0].value === "while") {
    return evalWhile(ast, state);
  }
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && ast[0].value === "for") {
    return evalFor(ast, state);
  }
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && ast[0].value === "defn") {
    return funcDef(ast, state);
  }
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && !Array.isArray(ast[1]) && ast[0].value === "set") {
    return evalSet(ast[1].value, ast[2], state);
  }
  if (!Array.isArray(ast[0]) && ast[0].type === Token.Id && !Array.isArray(ast[1]) && ast[0].value === "let") {
    return evalLet(ast[1].value, ast[2], state);
  }
  for (const frame of state) {
    for (const [key, value] of Object.entries(frame.vars)) {
      vars[key] = value;
    }
    for (const [key, value] of Object.entries(frame.funcs)) {
      funcs[key] = value;
    }
  }
  const res = ast.map((x) => Array.isArray(x) ? evaluate(x, state) : x).map((x) => vars[x.value] !== undefined ? vars[x.value] : x);
  const first = res[0];
  let returnVal = res.at(-1);
  if (first.type === Token.Id) {
    if (first.value === "print") {
      const str = res.slice(1).map((x) => Array.isArray(x.value) ? x.value.map((i) => i.value).join(" ") : x.value).join(" ");
      console.log(str);
      returnVal = {
        type: Token.String,
        value: str
      };
    }
    if (first.value === "/") {
      returnVal = {
        type: Token.Number,
        value: res[1].value / res[2].value
      };
    }
    if (first.value === "*") {
      returnVal = {
        type: Token.Number,
        value: res[1].value * res[2].value
      };
    }
    if (first.value === "+") {
      returnVal = {
        type: Token.Number,
        value: res[1].value + res[2].value
      };
    }
    if (first.value === "-") {
      returnVal = {
        type: Token.Number,
        value: res[1].value - res[2].value
      };
    }
    if (first.value === ">") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value > res[2].value
      };
    }
    if (first.value === ">=") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value >= res[2].value
      };
    }
    if (first.value === "<") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value < res[2].value
      };
    }
    if (first.value === "<=") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value <= res[2].value
      };
    }
    if (first.value === "=") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value === res[2].value
      };
    }
    if (first.value === "or") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value || res[2].value
      };
    }
    if (first.value === "and") {
      returnVal = {
        type: Token.Bool,
        value: res[1].value && res[2].value
      };
    }
    if (first.value === "not") {
      returnVal = {
        type: Token.Bool,
        value: !res[1].value
      };
    }
    if (first.value === "list") {
      returnVal = {
        type: Token.List,
        value: res.slice(1)
      };
    }
    if (first.value === "nth") {
      if (!Array.isArray(res[2].value))
        throw new Error("not accessing an array");
      returnVal = res[2].value.at(res[1].value);
    }
    if (first.value === "setnth") {
      if (!Array.isArray(res[2].value))
        throw new Error("not accessing an array");
      res[2].value[res[1].value] = res[3];
      return res[3];
    }
    if (first.value === "join") {
      returnVal = {
        type: Token.List,
        value: res.slice(1).flatMap((x) => x.value)
      };
    }
    if (first.value === "length") {
      returnVal = {
        type: Token.Number,
        value: res.at(1)?.value.length
      };
    }
    if (first.value === "push") {
      res[2].value.push(res[1]);
      returnVal = {
        type: Token.List,
        value: res.at(2).value
      };
    }
    if (Object.entries(funcs).map(([key]) => key).includes(first.value)) {
      returnVal = runFunc(first.value, res.slice(1), state);
    }
  }
  state.pop();
  return returnVal;
}

// lib/parser.ts
function parse(toks) {
  const items = [];
  while (toks.length > 0) {
    const currentTok = toks.splice(0, 1)[0];
    if (currentTok.type === Token.OpenParen) {
      items.push(parse(toks));
    } else if (currentTok.type === Token.CloseParen) {
      return items;
    } else if (currentTok.type === Token.Number) {
      items.push({
        type: currentTok.type,
        value: parseFloat(currentTok.value)
      });
    } else if (currentTok.type === Token.Bool) {
      items.push({
        type: currentTok.type,
        value: currentTok.value === "true" ? true : false
      });
    } else if (currentTok.type !== Token.WhiteSpace) {
      items.push(currentTok);
    }
  }
  return items;
}

// browser.ts
var run = function() {
  console.log("---RUNNING ECLISP PROGRAM---");
  const tokens = tokenize(textBox.value);
  const ast = parse(tokens);
  evaluate(ast);
  console.log("---DONE RUNNING ECLISP PROGRAM---");
};
console.log("Click the run button to run your eclisp program. :)");
var defaultInput = `(defn fibDp (n) (
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
var textBox = document.querySelector("textarea");
textBox.value = defaultInput;
var form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});
