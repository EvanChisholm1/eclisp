const file = Bun.file("./input.eclisp");

const text = await file.text();
console.log(text);
