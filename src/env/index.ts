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

    const { text, issues } = state;

    while (true) {
        text.consumeWhitespace();

        if (text.is('#'))
            parseComment(state);
        else if (text.is(/[A-Za-z_]/))
            parseVariable(state);
        else if (text.isNewLine)
            text.consumeLineEnding();
        else if (text.isTextEnd)
            break;
        else {
            issues.push({ issue: 'Invalid Text', element: text.slice(1) });
            text.consumeToTextEnd().consumeLineEnding();
        }
    }

    return state;
};

const parseComment = (state: EnvState) => {
    const { text } = state;

    text.mark()
        .consumeToLineEnd()
        .do(s => console.log('COMMENT', text.markedElement()))
        .commit();
};

const parseVariable = (state: EnvState) => {
    const { text } = state;

    let identifier = TextElement.empty; text
        .mark()
        .consume()
        .consumeWhile(/[A-Za-z0-9_]/)
        .do(s => { identifier = s.markedElement() })
        .commit();

    console.log('IDENTIFIER', identifier);

    text.consumeWhitespace();

    text.if(
        '=',
        s => s.consume(),
        () => captureIssue('Missing =', state, true, 1, 'rollback')
    );

    text.consumeWhitespace();


    let value = TextElement.empty;
    if (text.is('\'')) {
        text
            .consume()
            .mark()
            .consumeWhile(/[^\n\r\0']/);

        if (text.is('\'')) {
            value = text.markedElement;
            text.consume();
            text.commit();
        }
        else {
            captureIssue('Missing end quote', state, false, false, 'commit');
            text.commit();
        }

        console.log('SINGLE QUOTE VALUE', value);
    }
    else if (text.is('"')) {
        if (text.is('\\')) {

        }
        else if (text.is('$')) {

        }
        else if (text.is('"')) {
            value = text.markedElement;
            text.consume();
            text.commit();

            text.consumeWhitespace();

            if (!text.isEnding)
                captureIssue('Missing end quote', state, true, true, 'commit');
        }
    }

    text.consumeWhitespace();

    if (!text.isEnding)
        captureIssue('Missing end quote', state, true, true, 'commit');
};
