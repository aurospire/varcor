import { Result, TextScanner } from "@/util";

/*
    rule Env = Line* EOT;

    rule Line = Variable (';' | if (EOL | EOT))  ;

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

// rule Line = Whitespace? (Comment | Variable)? @(EOL|EOT);
const parseLine = (state: EnvParserState) => {
    const { text } = state;

    


};