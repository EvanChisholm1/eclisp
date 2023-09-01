import { Token, TokenList } from "./tokenise";

export type AST = Array<
    AST | { value: string | number | boolean | Array<any>; type: Token }
>;

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
                value: parseFloat(currentTok.value),
            });
        } else if (currentTok.type === Token.Bool) {
            items.push({
                type: currentTok.type,
                value: currentTok.value === "true" ? true : false,
            });
        } else if (currentTok.type !== Token.WhiteSpace) {
            items.push(currentTok);
        }
    }

    return items;
}
