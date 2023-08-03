enum Token {
    Number = "number",
    String = "string",
    OpenParen = "openParen",
    CloseParen = "closeParen",
    Id = "id",
    WhiteSpace = "whitespace",
}

const numbers = new Array(10).fill(0).map((_, i) => i.toString());

export function tokenize(input: string) {
    const inputStream = input.trim().split("");
    const tokens: {
        type: Token;
        value: string;
    }[] = [{ type: Token.WhiteSpace, value: " " }];

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
                console.log("previous token is also number");
                prevTok.value = prevTok.value.concat(currentChar);
            } else tokens.push({ type: Token.Number, value: currentChar });
        } else if (currentChar === " " || currentChar === "\n") {
            if (prevTok.type === Token.WhiteSpace) continue;
            tokens.push({ type: Token.WhiteSpace, value: " " });
        } else if (currentChar === '"') {
            let string = ['"'];
            let strC = "";
            do {
                strC = inputStream.splice(0, 1)[0];
                string.push(strC);
            } while (strC !== '"');
            tokens.push({ type: Token.String, value: string.join("") });
            // if(prevTok.type === Token.String && prevTok.value[0] ==='"') {
            //     prevTok.value = prevTok.value.concat('"')
            // }
        } else {
            const id: string[] = [currentChar];
            while (inputStream[0] !== " " && inputStream[0] !== "\n") {
                const cur = inputStream.splice(0, 1)[0];
                id.push(cur);
            }
            tokens.push({ type: Token.Id, value: id.join("") });
            // tokens.push({ type: Token.Id, value: currentChar });
        }
    }

    return tokens;
}
