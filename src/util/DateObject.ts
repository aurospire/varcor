import { Result } from "./Result";

export const timezone = '(?:(?<tzzero>Z)|(?:(?<tzhour>[+-]\\d{2}):(?<tzminute>\\d{2})))';

export const time = '(?:(?<hour>\\d{2})\:(?<minute>\\d{2})(?:\:(?<second>\\d{2})(?:\.(?<ms>\\d{3}))?)?)';

export const date = '(?:(?<year>\\d{4})(?:-(?<month>\\d{2})(?:-(?<day>\\d{2}))?)?)';

export const datetime = `^${date}(?:[T ]${time})?$`;

export const timeTz = `${time}${timezone}`;

export const datetimeTz = `${date}(?:[T ]${timeTz}?)?`;

const leapYear = (year: number): number => ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;

//                    J   F   M   A   M   J   J   A   S   O   N   D
const regularDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const monthMap: Record<string, number> = Object.fromEntries(monthNames.flatMap((value, index) => {
    return [[value, index + 1], [value.substring(0, 3), index + 1]];
}));
const monthDays = (year: number, month: number) => (regularDays[month - 1] ?? 30) + leapYear(year);


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

export type DateObjectRaw = {
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

const defaults = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    ms: 0,
} as const;

export const validateDateObject = (from: DateObjectRaw): Result<DateObject> => {
    const issues: string[] = [];

    const year = validateItem(issues, 'year', from.year, defaults.year, 0);
    const monthString = typeof from.month === 'string' ? monthMap[from.month.toLocaleUpperCase()] : undefined;
    const month = validateItem(issues, 'month', monthString ?? from.month, defaults.month, 1, 12);
    const day = validateItem(issues, 'day', from.day, defaults.day, 1, monthDays(year, month));
    const hour = validateItem(issues, 'hour', from.hour, defaults.hour, 0, 23);
    const minute = validateItem(issues, 'minute', from.minute, defaults.minute, 0, 59);
    const second = validateItem(issues, 'second', from.second, defaults.second, 0, 59);
    const ms = validateItem(issues, 'ms', from.ms, defaults.ms, 0, 999);

    let tz: TimeZone | undefined = undefined;
    if (from.tzzero) {
        if (from.tzzero.toLocaleUpperCase() === 'Z')
            tz = 'Z';
    }

    if (from.tzhour) {
        if (tz)
            issues.push('.tz can only be Z or an offset');

        const tzhour = validateItem(issues, 'tzhour', from.tzhour, 0, -14, 14);
        const tzminute = validateItem(issues, 'tzminute', from.tzminute, 0, 0, 59);

        const tzoffset = tzhour * 100 + (tzhour < 0 ? -tzminute : tzminute);

        if (tzoffset < -1400 || tzoffset > +1400)
            issues.push('.tz must be an offset between -14:00 and +14:00');
        else
            tz = { hour: tzhour, minute: tzminute };
    }

    return (issues.length) ? Result.failure(issues) : Result.success({ year, month, day, hour, minute, second, ms, tz });

};

export const DateObject = Object.seal({
    from: (value: DateObjectRaw) => validateDateObject(value)
});