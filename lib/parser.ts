import { Token, TokenList } from "./tokenise";

type AST = Array<AST | { value: string | number; type: Token }>;

export function parse(toks: TokenList): AST {
    const items: AST = [];

    while (toks.length > 0) {
        const currentTok = toks.splice(0, 1)[0];

        if (currentTok.type === Token.OpenParen) {
            items.push(parse(toks));
        } else if (currentTok.type === Token.CloseParen) {
            return items;
        } else if (currentTok.type === Token.Number) {
            items.push({
                type: currentTok.type,
                value: parseInt(currentTok.value),
            });
        } else if (currentTok.type !== Token.WhiteSpace) {
            items.push(currentTok);
        }
    }

    return items;
}
