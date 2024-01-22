export type TextLocation = {
    position: number;
    line: number;
    column: number;
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
        return this.#state.data.charAt(this.#state.location.position);
    }

    get isEnd(): boolean {
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

        if (!lastMark)
            return '';
        else
            return this.#state.data.slice(lastMark.position, this.position);
    }

    is(value: string | string[] | Set<string> | RegExp | ((value: string) => boolean)): boolean {
        if (typeof value === 'string')
            return this.current === value;
        else if (Array.isArray(value))
            return value.includes(this.current);
        else if (value instanceof Set)
            return value.has(this.current);
        else if (value instanceof RegExp)
            return this.current.match(value) !== null;

        else
            return value(this.current);
    }

    get isUpper() {
        return this.is(/[A-Z]/);
    }

    get isLower() {
        return this.is(/[a-z]/);
    }

    get isLetter() {
        return this.is(/[A-Za-z]/);
    }

    get isDigit() {
        return this.is(/[0-9]/);
    }

    get isHex() {
        return this.is(/[A-Fa-f0-9]/);
    }

    get isLetterOrDigit() {
        return this.is(/[A-Za-z0-9]/);
    }

    get isWhitespace() {
        return this.is(/[ \t]/);
    }

    get isLineEnd() {
        return this.is(/[\r\n]/);
    }

    consume(): TextScanner {
        if (this.isEnd) return this;

        const position = this.position;

        const current = this.current;

        const next = this.#state.data.charAt(position + 1);

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

    consumeIf(value: string | string[] | Set<string> | RegExp | ((value: string) => boolean)): TextScanner {
        return this.is(value) ? this.consume() : this;
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
