import { Result } from "./Result";
import { Variable } from "./Variable";

const datetime = /^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})(?: (?<hour>\d{2})\:(?<minute>\d{2})\:(?<second>\d{2})(?:\.(?<ms>\d{3}))?)?$/;

export class DateVariable extends Variable<Date> {
    #formats: RegExp[];

    constructor(from?: DateVariable) {
        super(from);

        this.#formats = (from ? [...from.#formats] : [datetime]);
    }

    format(regex: RegExp | RegExp[], clear: boolean = false): DateVariable {
        if (regex instanceof RegExp) regex = [regex];

        const newVar = this.__clone();
        newVar.#formats = clear ? [...regex] : [...this.#formats, ...regex];
        return newVar;
    }

    override get type(): string {
        return 'Date';
    }

    protected override  __parse(value: string): Result<Date> {
        for (const format of this.#formats) {
            const result = value.match(format);

            if (result) {
                const { year, month, day, hour, minute, second, ms } = result.groups ?? {};
                return Result.success(new Date(
                    Number.parseInt(year),
                    Number.parseInt(month),
                    Number.parseInt(day),
                    Number.parseInt(hour),
                    Number.parseInt(minute),
                    Number.parseInt(second),
                    Number.parseInt(ms))
                );
            }
        }

        return Result.failure(`must be date in format: ${this.#formats.map(f => f.toString()).join('|')}`);
    }

    protected override  __clone(): DateVariable {
        return new DateVariable(this);
    }

    protected __object(): Record<string, any> {
        return { ...super.__object(), formats: [...this.#formats] };
    }
}