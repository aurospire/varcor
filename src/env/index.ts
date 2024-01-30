import { Result, TextScanner } from "@/util";

/*
    rule Env = Line* EOT;

    rule Line = Variable (';' Varible')? (EOL | EOT);

    rule Variable = 'export'? Identifier '=' Value ';';

    
    rule Whitespace = [ \t];

    rule Comment = '#' (unless EOL .)*;
    
    rule EOT = '\0';

    rule EOL = [\r\n];

    rule Identifier = [A-Za-z_][A-Za-z0-9_]*;

    rule Value = MultilineQuoted | Quoted | Unquoted;

    rule MultilineQuoted = /'''/ EOL (unless /'''/ .)+ /'''/
*/

export type EnvIssue = {
    line: number;
    column: number;
    value: string;
    message: string,
};

type EnvParserState = {
    text: TextScanner,
    result: Record<string, string>;
    errors: EnvIssue[],
};

export const parseEnv = (data: string): Result<Record<string, string>, EnvIssue[]> => {
    const text = TextScanner.from(data);

    const state = {
        text,
        result: {},
        errors: []
    };

    while (!text.isTextEnd) {
        parseLine(state);
    }

    return (state.errors.length) ? Result.failure(state.errors) : Result.success(state.result);
};

// rule Line = Ignorable? (Variable Whitespace? ';' Ignorable?)* (EOL | EOT);
const parseLine = (state: EnvParserState) => {
    const { text } = state;

    parseIgnorable(state);

    while (true) {
        if (!parseVariable(state))
            break;

        text.consumeWhitespace();

        if (text.is(';'))
            text.consume();
        else
            state.errors.push({
                line: text.line,
                column: text.column,
                value: text.value,
                message: 'Missing Semicolon'
            });
    }
};

const parseIgnorable = (state: EnvParserState) => {
    const { text } = state;

    text.consumeWhitespace();

    if (text.is('#'))
        text.consumeToLineEnd();

    text.consumeWhitespace();
};

const parseVariable = (state: EnvParserState): boolean => {

};