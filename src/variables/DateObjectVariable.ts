import { Result } from "./Result";
import { Variable } from "./Variable";

const timezone = '(?:(?<tzzero>Z)|(?:(?<tzhour>[+-]\\d{2}):(?<tzminute>\\d{2})))';

const time = '(?:(?<hour>\\d{2})\:(?<minute>\\d{2})(?:\:(?<second>\\d{2})(?:\.(?<ms>\\d{3}))?)?)';

const date = '(?:(?<year>\\d{4})(?:-(?<month>\\d{2})(?:-(?<day>\\d{2}))?)?)';

const datetime = `^${date}(?:[T ]${time})?$`;

const timeAndTz = `${time}${timezone}`;

const datetimeAndTz = `^${date}(?:[T ]${timeAndTz}?)?$`;


export type TimeZone = 'Z' | { hour: number; minute: number; };

export type DateObject = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
    tz?: TimeZone;
};

const validateItem = (issues: string[], name: string, value: number, min: number, max?: number) => {
    if (isNaN(value) || value < min || value > (max ?? Infinity) || !Number.isFinite(Math.abs(value)))
        issues.push(`.${name} must be ${max !== undefined ? `greater than ${min}` : `a number ${min}-${max}`}`);
};

export const validateDateObject = (d: DateObject): string[] | undefined => {
    const issues: string[] = [];

    validateItem(issues, 'year', d.year, 0);
    validateItem(issues, 'month', d.month, 1, 12);
    validateItem(issues, 'day', d.day, 1, monthDays(d.year, d.month));
    validateItem(issues, 'hour', d.hour, 0, 23);
    validateItem(issues, 'minute', d.hour, 0, 59);
    validateItem(issues, 'second', d.hour, 0, 59);
    validateItem(issues, 'ms', d.hour, 0, 999);
};

export const validateTimeZone = (value: TimeZone): string[] | undefined => {

};

const leapYear = (year: number): number => ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;

//                    J   F   M   A   M   J   J   A   S   O   N   D
const regularDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthDays = (year: number, month: number) => (regularDays[month - 1] ?? 30) + leapYear(year);


export class DateObjectVariable extends Variable<DateObject> {
    #formats: RegExp[];

    static date = new RegExp(date);

    static time = new RegExp(time, 'i');

    static timeAndTz = new RegExp(time, 'i');

    static datetime = new RegExp(datetime, 'i');

    static datetimeAndTz = new RegExp(datetimeAndTz, 'i');

    constructor(from?: DateObjectVariable, ...formats: RegExp[]) {
        super(from);

        this.#formats = formats.length ? formats : (from ? [...from.#formats] : [DateObjectVariable.datetimeAndTz]);
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
                const tzzero = groups.tzzero;
                const tzhour = Number.parseInt(groups.tzhour) || undefined;
                const tzminute = Number.parseInt(groups.tzminute) || undefined;

                const issues: string[] = [];

                let tz: TimeZone;

                if (tzzero && (tzhour || tzminute))
                    issues.push('.tz must be Z or an offset');
                else {
                    if (tzzero)
                        tz = tzzero;
                }

                const dateObject: DateObject = {};

                if (issues.length);
                return Result.failure(issues);
                else
                return Result.success({ year, month, day, hour, minute, second, ms });
        }
    }

        return Result.failure(`must be in a valid date format.`);
    }

    protected override  __clone(): DateObjectVariable {
    return new DateObjectVariable(this);
}

    protected __object(): Record < string, any > {
    return { ...super.__object(), formats: [...this.#formats] };
}
}