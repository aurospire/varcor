import { TextElement, TextScanner, TextState } from "@/util";

export type EnvIssue = {
    issue: string;
    element: TextElement;
};

export type EnvState = {
    text: TextScanner;
    env: Record<string, string>;
    issues: EnvIssue[];
};



export const parseEnv = (from: string, env: Record<string, string>): EnvState => {
    const state: EnvState = {
        text: TextScanner.from(from),
        env: { ...env },
        issues: []
    };

    const { text } = state;

    while (true) {
        text.cosumeWhitespace();

        if (text.is('#'))
            parseComment(state);
        else if (text.is(/[A-Za-z_]/))
            parseVariable(state);
        else if (text.isNewLine)
            text.consumeLineEnd();
        else if (text.isTextEnd)
            break;
        else {
            captureIssue('Invalid Text', state, true, true);
        }
    }

    return state;
};

const captureIssue = (issue: string, state: EnvState, mark: boolean, skip: boolean) => {
    const { text, issues } = state;
    if (!mark) text.mark();
    if (skip) text.consumeToLineEnd(false);
    const element = text.markedElement;
    console.log('ISSUE', element);
    if (skip) text.consumeLineEnd();
    text.commit();
    issues.push({ issue: 'Invalid Text', element });
};

const parseComment = (state: EnvState) => {
    const { text } = state;
    text.mark();
    text.consume();
    text.consumeToLineEnd(true);
    const element = text.markedElement;
    console.log('COMMENT', element);
    text.commit();
};

const parseVariable = (state: EnvState) => {
    const { text } = state;

    let identifier: TextElement = TextElement.empty; text
        .mark()
        .consume()
        .consumeWhile(/[A-Za-z0-9_]/)
        .do(s => { identifier = s.markedElement; })
        .commit();

    console.log('IDENTIFIER', identifier);
};
