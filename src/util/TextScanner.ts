export type TextLocation = {
    position: number;
    line: number;
    column: number;
};

export type TextElement = {
    value: string;
    location: TextLocation;
};

export type TextState = {
    data: string;
    location: TextLocation;
    marks: TextLocation[];
};

export class TextScanner {
    #state: TextState;


    constructor(state: TextState) {
        this.#state = state;
    }


    get data(): string {
        return this.#state.data;
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
        return this.#state.data.charAt(this.#state.location.position);
    }

    get isTextEnd(): boolean {
        return this.#state.location.position === this.#state.data.length;
    }


    get immutable(): boolean {
        return Object.isSealed(this.#state);
    }


    mark(): TextScanner {
        if (this.immutable) {
            return new TextScanner(Object.seal({
                ...this.#state,
                marks: [...this.#state.marks, this.#state.location]
            }));
        }
        else {
            this.#state.marks.push(this.#state.location);
            return this;
        }
    }

    rollback(): TextScanner {
        const lastMark = this.#lastMark;

        if (lastMark) {
            if (this.immutable) {
                return new TextScanner(Object.seal({
                    ...this.#state,
                    location: lastMark,
                    marks: this.#state.marks.slice(0, -1)
                }));
            }
            else {
                this.#state.location = lastMark;
                this.#state.marks.pop();
            }
        }

        return this;
    }

    commit(): TextScanner {
        const lastMark = this.#lastMark;

        if (lastMark) {
            if (this.immutable) {
                return new TextScanner(Object.seal({
                    ...this.#state,
                    marks: this.#state.marks.slice(0, -1)
                }));
            }
            else {
                this.#state.marks.pop();
            }
        }

        return this;
    }

    get #lastMark(): TextLocation | undefined {
        return this.#state.marks.at(-1);
    }


    get markCount(): number {
        return this.#state.marks.length;
    }

    get markedText(): string {
        const lastMark = this.#lastMark;

        return this.#state.data.slice(lastMark?.position ?? this.position, this.position);
    }

    get markedElement(): TextElement {
        const location = this.#lastMark ?? this.location;

        return {
            location: { ...location },
            value: this.#state.data.slice(location.position, this.position)
        };
    }


    is(check: boolean | string | string[] | Set<string> | RegExp | ((value: string, scanner: TextScanner) => boolean)): boolean {
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

    get isLineEnd() {
        return this.current.match(/[\r\n]/) !== null;
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

        if (this.immutable) {
            return new TextScanner(Object.seal({ ...this.#state, location: newLocation }));
        }
        else {
            this.#state.location = newLocation;
            return this;
        }
    }

    consumeIf(check: boolean | string | string[] | Set<string> | RegExp | ((value: string, scanner: TextScanner) => boolean)): TextScanner {
        if (typeof check !== 'boolean')
            check = this.is(check);

        return check ? this.consume() : this;
    }


    skipWhile(check: boolean | string | string[] | Set<string> | RegExp | ((value: string, scanner: TextScanner) => boolean)): TextScanner {
        let scanner: TextScanner = this;

        while (scanner.is(check))
            scanner = scanner.consume();

        return scanner;
    }

    skipWhitespace(includeLineEnd: boolean = false): TextScanner {
        const regex = includeLineEnd ? /[ \t\r\n]/ : /[ \t]/;

        let scanner: TextScanner = this;

        while (scanner.current.match(regex))
            scanner = scanner.consume();

        return scanner;
    }

    skipToLineEnd(): TextScanner {
        let scanner: TextScanner = this;

        while (!scanner.current.match(/[\r\n]/))
            scanner = scanner.consume();

        return scanner;
    }

    skipLineEnd(complete: boolean = true): TextScanner {
        const current = this.peek(0);

        const next = this.peek(1);

        return this.isLineEnd
            ? this.consume().consumeIf(complete && current === '\r' && next === '\n')
            : this;
    }


    debug() {
        console.log(this.#state.data, this.#state.location, this.#state.marks);
    }

    static from(data: string, immutable: boolean = false) {
        const state = {
            data,
            location: { position: 0, line: 0, column: 0 },
            marks: []
        };

        return new TextScanner(immutable ? Object.seal(state) : state);
    }
}
