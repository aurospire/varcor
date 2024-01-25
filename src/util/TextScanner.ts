export type TextLocation = {
    position: number;
    line: number;
    column: number;
};

export const TextLocation = Object.seal({
    get empty(): TextLocation {
        return { position: 0, line: 0, column: 0 };
    }
});

export type TextElement = {
    value: string;
    location: TextLocation;
};

export const TextElement = Object.seal({
    get empty(): TextElement {
        return { value: '', location: TextLocation.empty };
    }
});

export type TextState = TextElement & {
    marks?: TextLocation[];
};

export type TextScannerActionResult = TextScanner | undefined | void;

export type TextScannerAction<R extends TextScannerActionResult = TextScannerActionResult> = (scanner: TextScanner) => R;

export type TextScannerCheck =
    | boolean
    | string
    | RegExp
    | string[]
    | Set<string>
    | ((value: string, scanner: TextScanner) => boolean);


type RealType<T> = T extends void ? undefined : T;

export class TextScanner implements TextElement {
    #state: TextState;


    constructor(state: TextState) {
        this.#state = state;
    }

    get isImmutable(): boolean {
        return Object.isSealed(this.#state);
    }


    get value(): string {
        return this.#state.value;
    }

    get location(): TextLocation {
        return { ...this.#state.location };
    }

    get position(): number {
        return this.#state.location.position;
    }

    get line(): number {
        return this.#state.location.line;
    }

    get column(): number {
        return this.#state.location.column;
    }

    get current(): string {
        return this.peek();
    }


    peek(offset: number = 0): string {
        return this.#state.value.charAt(this.#state.location.position) || '\0';
    }



    clone(immutable?: boolean): TextScanner {
        const state = {
            value: this.#state.value,
            location: { ...this.#state.location },
            marks: this.#state.marks ? this.#state.marks.map(mark => ({ ...mark })) : undefined
        };

        if (immutable === undefined)
            immutable = this.isImmutable;

        return new TextScanner(immutable ? Object.seal(state) : state);
    }

    slice(length: number = 0): TextElement {
        return {
            value: this.sliceText(length),
            location: { ...this.location }
        };
    }

    extract(length: number = 0): TextElement {
        return {
            value: this.sliceText(length),
            location: TextLocation.empty
        };
    }

    sliceText(length: number = 0): string {
        return this.value.slice(this.position, length);
    }

    mark(): TextScanner {
        if (this.isImmutable) {
            return new TextScanner(Object.seal({
                ...this.#state,
                marks: [...(this.#state.marks ?? []), this.#state.location]
            }));
        }
        else {
            (this.#state.marks = this.#state.marks ?? []).push(this.#state.location);
            return this;
        }
    }

    rollback(): TextScanner {
        const lastMark = this.#lastMark;

        if (lastMark) {
            if (this.isImmutable) {
                return new TextScanner(Object.seal({
                    ...this.#state,
                    location: lastMark,
                    marks: (this.#state.marks ?? []).slice(0, -1)
                }));
            }
            else {
                this.#state.location = lastMark;
                (this.#state.marks = this.#state.marks ?? []).pop();
            }
        }

        return this;
    }

    commit(): TextScanner {
        const lastMark = this.#lastMark;

        if (lastMark) {
            if (this.isImmutable) {
                return new TextScanner(Object.seal({
                    ...this.#state,
                    marks: (this.#state.marks = this.#state.marks ?? []).slice(0, -1)
                }));
            }
            else {
                (this.#state.marks = this.#state.marks ?? []).pop();
            }
        }

        return this;
    }

    get #lastMark(): TextLocation | undefined {
        return (this.#state.marks = this.#state.marks ?? []).at(-1);
    }


    get markCount(): number {
        return (this.#state.marks = this.#state.marks ?? []).length;
    }

    get markedText(): string {
        const lastMark = this.#lastMark;

        return this.#state.value.slice(lastMark?.position ?? this.position, this.position);
    }

    markedElement(): TextElement {
        const location = this.#lastMark ?? this.location;

        return {
            value: this.#state.value.slice(location.position, this.position),
            location: { ...location }
        };
    }


    is(check: TextScannerCheck): boolean {
        if (typeof check === 'boolean')
            return check;
        else if (typeof check === 'string')
            return this.current === check;
        else if (check instanceof RegExp)
            return this.current.match(check) !== null;
        else if (Array.isArray(check))
            return check.includes(this.current);
        else if (check instanceof Set)
            return check.has(this.current);
        else
            return check(this.current, this);
    }

    get isUpper() {
        return this.current.match(/[A-Z]/) !== null;
    }

    get isLower() {
        return this.current.match(/[a-z]/) !== null;
    }

    get isLetter() {
        return this.current.match(/[A-Za-z]/) !== null;
    }

    get isDigit() {
        return this.current.match(/[0-9]/) !== null;
    }

    get isHex() {
        return this.current.match(/[A-Fa-f0-9]/) !== null;
    }

    get isLetterOrDigit() {
        return this.current.match(/[A-Za-z0-9]/) !== null;
    }

    get isWhitespace() {
        return this.current.match(/[ \t]/) !== null;
    }

    get isNewLine() {
        return this.current.match(/[\r\n]/) !== null;
    }

    get isEnding() {
        return this.current.match(/[\r\n\0]/) !== null;
    }

    get isTextEnd(): boolean {
        return this.#state.location.position === this.#state.value.length;
    }


    consume(): TextScanner {
        if (this.isTextEnd) return this;

        const position = this.position;

        const current = this.peek();

        const next = this.peek(1);

        const newLine = current === '\n' || (current === '\r' && next !== '\n');

        const newLocation = {
            position: position + 1,
            line: newLine ? this.line + 1 : this.line,
            column: newLine ? 0 : this.column + 1
        };

        if (this.isImmutable) {
            return new TextScanner(Object.seal({ ...this.#state, location: newLocation }));
        }
        else {
            this.#state.location = newLocation;
            return this;
        }
    }

    consumeIf(check: TextScannerCheck): TextScanner {
        if (typeof check !== 'boolean')
            check = this.is(check);

        return check ? this.consume() : this;
    }

    skip(amount: number = 0): TextScanner {
        let scanner: TextScanner = this;

        for (let i = 0; i < amount; i++) {
            if (scanner.isTextEnd) break;
            scanner = scanner.consume();
        }

        return scanner;
    }

    consumeWhile(check: TextScannerCheck): TextScanner {
        let scanner: TextScanner = this;

        while (!scanner.isTextEnd && scanner.is(check))
            scanner = scanner.consume();

        return scanner;
    }

    consumeWhitespace(includeLineEnd: boolean = false): TextScanner {
        const regex = includeLineEnd ? /[ \t\r\n]/ : /[ \t]/;

        let scanner: TextScanner = this;

        while (scanner.current.match(regex))
            scanner = scanner.consume();

        return scanner;
    }

    consumeToTextEnd(): TextScanner {
        let scanner: TextScanner = this;

        while (!scanner.isTextEnd)
            scanner = scanner.consume();

        return scanner;
    }

    consumeToLineEnd(): TextScanner {
        let scanner: TextScanner = this;

        while (!scanner.isEnding)
            scanner = scanner.consume();

        return scanner;
    }

    consumeLineEnding(): TextScanner {
        const current = this.peek(0);

        if (current === '\n')
            return this.consume();
        else if (current === '\r')
            return this.consume().consumeIf('\n');
        else
            return this;
    }


    do(action: TextScannerAction): TextScanner {
        return action(this) || this;
    }

    doIf(check: TextScannerCheck, action: TextScannerAction): TextScanner {
        return this.is(check) ? action(this) || this : this;
    }


    if<T extends TextScannerActionResult, F extends TextScannerActionResult>(
        check: TextScannerCheck,
        action: TextScannerAction<T>,
        otherwise: TextScannerAction<F>
    ): RealType<T | F> {
        return (this.is(check) ? action(this) : otherwise(this)) as RealType<T | F>;
    }


    debug() {
        console.log(this.#state);
    }

    static from(value: string | TextElement, immutable: boolean = false) {
        const state: TextElement = typeof value === 'string'
            ? {
                value,
                location: TextLocation.empty
            }
            : {
                value: value.value,
                location: { ...value.location }
            }
            ;

        return new TextScanner(immutable ? Object.seal(state) : state);
    }
}
