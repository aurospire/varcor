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

export type DateType = 'date' | 'time' | 'datetime' | 'timeTz' | 'datetimeTz';

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
    tzutc?: string;
    tzhour?: number | string;
    tzminute?: number | string;
};

const defaults = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    ms: 0,
    tz: undefined
} as const satisfies DateObject;

const validateItem = (issues: string[], name: string, value: number | string | undefined, defaultTo: number, min: number, max?: number): number => {
    if (typeof value === 'string')
        value = Number.parseInt(value);
    else if (value === undefined)
        value = defaultTo;

    if (isNaN(value) || value < min || value > (max ?? Infinity) || !Number.isFinite(Math.abs(value)))
        issues.push(`.${name} must be ${max !== undefined ? `greater than ${min}` : `a number ${min}-${max}`}`);

    return value || defaultTo;
};

export const DateObject = Object.seal({
    from: (value: DateObjectRaw): Result<DateObject> => {
        const issues: string[] = [];

        const year = validateItem(issues, 'year', value.year, defaults.year, 0);
        const monthString = typeof value.month === 'string' ? monthMap[value.month.toLocaleUpperCase()] : undefined;
        const month = validateItem(issues, 'month', monthString ?? value.month, defaults.month, 1, 12);
        const day = validateItem(issues, 'day', value.day, defaults.day, 1, monthDays(year, month));
        const hour = validateItem(issues, 'hour', value.hour, defaults.hour, 0, 23);
        const minute = validateItem(issues, 'minute', value.minute, defaults.minute, 0, 59);
        const second = validateItem(issues, 'second', value.second, defaults.second, 0, 59);
        const ms = validateItem(issues, 'ms', value.ms, defaults.ms, 0, 999);

        let tz: TimeZone | undefined = undefined;
        if (value.tzutc) {
            if (value.tzutc.toLocaleUpperCase() === 'Z')
                tz = 'Z';
        }

        if (value.tzhour) {
            if (tz)
                issues.push('.tz can only be Z (UTC) or an offset');

            const tzhour = validateItem(issues, 'tzhour', value.tzhour, 0, -14, 14);
            const tzminute = validateItem(issues, 'tzminute', value.tzminute, 0, 0, 59);

            const tzoffset = tzhour * 100 + (tzhour < 0 ? -tzminute : tzminute);

            if (tzoffset < -1400 || tzoffset > +1400)
                issues.push('.tz must be an offset between -14:00 and +14:00');
            else
                tz = { hour: tzhour, minute: tzminute };
        }

        return (issues.length) ? Result.failure(issues) : Result.success({ year, month, day, hour, minute, second, ms, tz });

    },
    to: (value: DateObject, type: DateType): DateObject => {
        const date = type === 'date' || type === 'datetime' || type === 'datetimeTz';
        const time = type !== 'date';
        const tz = type === 'timeTz' || type === 'datetimeTz';

        return {
            year: date ? value.year : defaults.year,
            month: date ? value.month : defaults.month,
            day: date ? value.day : defaults.day,
            hour: time ? value.hour : defaults.hour,
            minute: time ? value.minute : defaults.minute,
            second: time ? value.second : defaults.second,
            ms: time ? value.ms : defaults.ms,
            tz: tz ? value.tz : defaults.tz
        };
    },
    toISO: (value: DateObject, full: boolean = false): string => {
        let result = '';
        result += value.year.toFixed(0).padStart(4, '0');

        result += '-';
        result += value.month.toFixed(0).padStart(2, '0');

        result += '-';
        result += value.day.toFixed(0).padStart(2, '0');

        if (full || (value.hour + value.minute + value.second + value.ms)) {
            result += 'T';
            result += value.hour.toFixed(0).padStart(2, '0');

            result += ':';
            result += value.minute.toFixed(0).padStart(2, '0');

            result += ':';
            result += value.second.toFixed(0).padStart(2, '0');

            if (full || value.ms) {
                result += '.';
                result += value.ms.toFixed(0).padStart(3, '0');
            }
        }

        if (value.tz) {
            if (typeof value.tz === 'string')
                result += value.tz;
            else {
                const { hour, minute } = value.tz;

                result += (hour < 0 ? '-' : '+');

                result += Math.abs(hour).toFixed(0).padStart(2, '0');
                if (full || minute) {
                    result += ':';
                    result += minute.toFixed(0).padStart(2, '0');
                }
            }
        }

        return result;
    },
});