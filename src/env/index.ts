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
        text.consumeWhitespace();

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

const captureIssue = (issue: string, state: EnvState, mark: boolean, skip: boolean | number, after: 'rollback' | 'commit' = 'commit') => {
    const { text, issues } = state;
    if (mark) text.mark();
    if (skip === true) text.consumeToLineEnd(false);
    else if (typeof skip === 'number') text.skip(skip);
    const element = text.markedElement;
    console.log('ISSUE', element);
    if (skip) text.consumeLineEnd();
    if (after === 'commit') text.commit(); else text.rollback;
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

    let identifier = TextElement.empty; text
        .mark()
        .consume()
        .consumeWhile(/[A-Za-z0-9_]/)
        .do(s => { identifier = s.markedElement; })
        .commit();

    console.log('IDENTIFIER', identifier);

    text.consumeWhitespace();

    text.if(
        '=',
        s => s.consume(),
        () => captureIssue('Missing =', state, true, 1, 'rollback')
    );

    text.consumeWhitespace();

    if (text.is('\'')) {
        let value = TextElement.empty;

        text
            .consume()
            .mark()
            .consumeWhile(/[^\n\r\0']/);

        if (text.is('\'')) {
            value = text.markedElement;
            text.consume();
            text.commit();

            text.consumeWhitespace();

            if (!text.isEnding)
                captureIssue('Missing end quote', state, true, true, 'commit');
        }
        else {
            text.consume();
            captureIssue('Missing end quote', state, false, false, 'commit');
            text.commit();
        }

        console.log('VALUE', value);
    }
    else if (text.is('"')) {

    }

};
