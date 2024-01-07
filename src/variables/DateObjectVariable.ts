import { Result } from "./Result";
import { Variable } from "./Variable";

const datetime = /^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})(?: (?<hour>\d{2})\:(?<minute>\d{2})\:(?<second>\d{2})(?:\.(?<ms>\d{3}))?)?$/;

export type DateObject = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
};

const leapYear = (year: number): number => ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;

//                    J   F   M   A   M   J   J   A   S   O   N   D
const regularDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthDays = (year: number, month: number) => regularDays[month - 1] + leapYear(year);

export class DateObjectVariable extends Variable<DateObject> {
    #formats: RegExp[];

    constructor(from?: DateObjectVariable) {
        super(from);

        this.#formats = (from ? [...from.#formats] : [datetime]);
    }

    format(regex: RegExp | RegExp[], clear: boolean = false): DateObjectVariable {
        if (regex instanceof RegExp) regex = [regex];

        const newVar = this.__clone();
        newVar.#formats = clear ? [...regex] : [...this.#formats, ...regex];
        return newVar;
    }

    override get type(): string {
        return 'Date';
    }

    protected override  __parse(value: string): Result<DateObject> {
        for (const format of this.#formats) {
            const result = value.match(format);

            if (result) {
                const groups = result.groups ?? {};

                const year = Number.parseInt(groups.year ?? '0');
                const month = Number.parseInt(groups.month ?? '1');
                const day = Number.parseInt(groups.day ?? '1');
                const hour = Number.parseInt(groups.hour ?? '0');
                const minute = Number.parseInt(groups.minute ?? '0');
                const second = Number.parseInt(groups.second ?? '0');
                const ms = Number.parseInt(groups.ms ?? '0');

                const issues: string[] = [];

                if (isNaN(year) || year < 0 || year == Infinity)
                    issues.push('.year must be greater than 0');

                if (isNaN(month) || month < 1 || month > 12)
                    issues.push('.month must be a number 1-12');

                const maxDays = monthDays(year || 0, month || 1);

                if (isNaN(day) || day < 1 || day > maxDays)
                    issues.push(`.day must be a number 1-${maxDays}`);

                if (isNaN(hour) || hour < 0 || hour > 59)
                    issues.push('.hour must be a number 0-59');

                if (isNaN(minute) || minute < 0 || minute > 59)
                    issues.push('.minute must be a number 0-59');

                if (isNaN(second) || second < 0 || second > 59)
                    issues.push('.second must be a number 0-59');

                if (isNaN(ms) || ms < 0 || ms > 999)
                    issues.push('.ms must be a number 0-999');

                if (issues.length)
                    return Result.failure(issues);
                else
                    return Result.success({ year, month, day, hour, minute, second, ms });

            }
        }

        return Result.failure(`must be date in format: ${this.#formats.map(f => f.toString()).join('|')}`);
    }

    protected override  __clone(): DateObjectVariable {
        return new DateObjectVariable(this);
    }

    protected __object(): Record<string, any> {
        return { ...super.__object(), formats: [...this.#formats] };
    }
}