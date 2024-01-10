import { Result } from "./Result";
import { Variable } from "./Variable";

const timezone = '(?:(?<tzzero>Z)|(?:(?<tzhour>[+-]\\d{2}):(?<tzminute>\\d{2})))';

const time = '(?:(?<hour>\\d{2})\:(?<minute>\\d{2})(?:\:(?<second>\\d{2})(?:\.(?<ms>\\d{3}))?)?)';

const date = '(?:(?<year>\\d{4})(?:-(?<month>\\d{2})(?:-(?<day>\\d{2}))?)?)';

const datetime = `^${date}(?:[T ]${time})?$`;

const timeTz = `${time}${timezone}`;

const datetimeTz = `^${date}(?:[T ]${timeTz}?)?$`;


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

const validateItem = (issues: string[], name: string, value: number | string | undefined, defaultTo: number, min: number, max?: number): number => {
    if (typeof value === 'string')
        value = Number.parseInt(value);
    else if (value === undefined)
        value = defaultTo;

    if (isNaN(value) || value < min || value > (max ?? Infinity) || !Number.isFinite(Math.abs(value)))
        issues.push(`.${name} must be ${max !== undefined ? `greater than ${min}` : `a number ${min}-${max}`}`);

    return value || defaultTo;
};

export const validateDateObject = (d: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    hour?: number | string;
    minute?: number | string;
    second?: number | string;
    ms?: number | string;
    tzzero?: string;
    tzhour?: number | string;
    tzminute?: number | string;
}
): string[] | DateObject => {
    const issues: string[] = [];

    const year = validateItem(issues, 'year', d.year, 2000, 0);
    const month = validateItem(issues, 'month', d.month, 1, 1, 12);
    const day = validateItem(issues, 'day', d.day, 1, 1, monthDays(year, month));
    const hour = validateItem(issues, 'hour', d.hour, 0, 0, 23);
    const minute = validateItem(issues, 'minute', d.minute, 0, 0, 59);
    const second = validateItem(issues, 'second', d.second, 0, 0, 59);
    const ms = validateItem(issues, 'ms', d.ms, 0, 0, 999);

    let tz: TimeZone | undefined;
    if (d.tzzero) {
        if (d.tzzero.toLocaleUpperCase() === 'Z')
            tz = 'Z';
    }

    if (d.tzhour) {
        if (tz)
            issues.push('.tz can only be Z or an offset');

        const tzhour = validateItem(issues, 'tzhour', d.tzhour, 0, -14, 14);
        const tzminute = validateItem(issues, 'tzminute', d.tzminute, 0, 0, 59);

        const tzoffset = tzhour * 100 + (tzhour < 0 ? -tzminute : tzminute);

        if (tzoffset < -1400 || tzoffset > +1400)
            issues.push('.tz must be an offset between -14:00 and +14:00');
        else
            tz = { hour: tzhour, minute: tzminute };
    }

    return (issues.length) ? issues : { year, month, day, hour, minute, second, ms, tz };

};

const leapYear = (year: number): number => ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;

//                    J   F   M   A   M   J   J   A   S   O   N   D
const regularDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthDays = (year: number, month: number) => (regularDays[month - 1] ?? 30) + leapYear(year);


export class DateObjectVariable extends Variable<DateObject> {
    #formats: RegExp[];

    static date = new RegExp(date);

    static time = new RegExp(time, 'i');

    static timeTz = new RegExp(time, 'i');

    static datetime = new RegExp(datetime, 'i');

    static datetimeTz = new RegExp(datetimeTz, 'i');

    constructor(from?: DateObjectVariable, ...formats: RegExp[]) {
        super(from);

        this.#formats = formats.length ? formats : (from ? [...from.#formats] : [DateObjectVariable.datetimeTz]);
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
            const match = value.match(format);

            if (match) {
                const groups = match.groups ?? {};

                const result = validateDateObject(groups);

                if (Array.isArray(result))
                    return Result.failure(result);
                else
                    return Result.success(result);
            }
        }

        return Result.failure(`must be in a valid date format.`);
    }

    protected override  __clone(): DateObjectVariable {
        return new DateObjectVariable(this);
    }

    protected __object(): Record<string, any> {
        return { ...super.__object(), formats: [...this.#formats] };
    }
}