import { Result } from "./Result";

/**
 * Represents the different types of date formats.
 */
export type DateType = 'date' | 'time' | 'datetime' | 'timeTz' | 'datetimeTz';

/** Regular expressions for different date formats */

/** Regular expression for a timezone */
export const timezone = '(?:(?<tzutc>Z)|(?:(?<tzhour>[+-]\\d{2}):(?<tzminute>\\d{2})))';

/** Regular expression for time */
export const time = '(?:(?<hour>\\d{2})\:(?<minute>\\d{2})(?:\:(?<second>\\d{2})(?:\.(?<ms>\\d{3}))?)?)';

/** Regular expression for date */
export const date = '(?:(?<year>\\d{4})(?:-(?<month>\\d{2})(?:-(?<day>\\d{2}))?)?)';

/** Regular expression for datetime */
export const datetime = `^${date}(?:[T ]${time})?$`;

/** Regular expression for time with timezone */
export const timeTz = `${time}${timezone}`;

/** Regular expression for datetime with timezone */
export const datetimeTz = `${date}(?:[T ]${timeTz}?)?`;


const makeRegex = (value: string): RegExp => new RegExp(`^${value}$`, 'i');

/**
 * Regular expressions for date and time formats.
 */
const regex = Object.seal({
    raw: Object.seal({
        date: date,
        time: time,
        timeTz: timeTz,
        datetime: datetime,
        datetimeTz: datetimeTz,
    } as const),
    date: makeRegex(date),
    time: makeRegex(time),
    timeTz: makeRegex(timeTz),
    datetime: makeRegex(datetime),
    datetimeTz: makeRegex(datetimeTz),
    /**
     * Resolves a given date format into a regular expression.
     * @param from The date format or regular expression.
     * @returns A regular expression for the specified format.
     */
    resolve: (from?: DateType | RegExp): RegExp => {
        if (from instanceof RegExp)
            return from;
        else
            switch (from) {
                case 'date': return makeRegex(date);
                case 'time': return makeRegex(time);
                case 'timeTz': return makeRegex(timeTz);
                case 'datetime': return makeRegex(datetime);
                case 'datetimeTz': return makeRegex(datetimeTz);
                default: return makeRegex(datetimeTz);
            }
    }
} as const);

const leapYear = (year: number): number => ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 1 : 0;

const regularDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const monthMap: Record<string, number> = Object.fromEntries(monthNames.flatMap((value, index) => {
    return [[value, index + 1], [value.substring(0, 3), index + 1]];
}));

const monthDays = (year: number, month: number) => (regularDays[month - 1] ?? 30) + leapYear(year);

/**
 * Represents the different types of timezones.
 */
export type TimeZone = { type: 'local'; } | { type: 'utc'; } | { type: 'offset', hour: number; minute: number; };

/**
 * Represents a date object with various components.
 */
export type DateObject = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
    tz: TimeZone;
};

/**
 * Represents a raw date object with optional components.
 */
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

/** Default values for date components */
const defaults = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    ms: 0,
    tz: Object.seal({ type: 'local'}) satisfies TimeZone
} as const;

/**
 * Validates an individual date component and assigns a default value if necessary.
 * @param issues The array to store validation issues.
 * @param name The name of the date component.
 * @param value The value of the date component.
 * @param defaultTo The default value for the date component.
 * @param min The minimum allowed value for the date component.
 * @param max The maximum allowed value for the date component.
 * @returns The validated and defaulted value of the date component.
 */
const validateItem = (issues: string[], name: string, value: number | string | undefined, defaultTo: number, min: number, max?: number): number => {
    if (typeof value === 'string')
        value = Number.parseInt(value);
    else if (value === undefined)
        value = defaultTo;

    if (isNaN(value) || value < min || value > (max ?? Infinity) || !Number.isFinite(Math.abs(value)))
        issues.push(`.${name} must be ${max !== undefined ? `greater than ${min}` : `a number ${min}-${max}`}`);

    return value || defaultTo;
};

const validateRawObject = (value: DateObjectRaw): Result<DateObject, string[]> => {
    const issues: string[] = [];

    const year = validateItem(issues, 'year', value.year, defaults.year, 0);
    const monthString = typeof value.month === 'string' ? monthMap[value.month.toLocaleUpperCase()] : undefined;
    const month = validateItem(issues, 'month', monthString ?? value.month, defaults.month, 1, 12);
    const day = validateItem(issues, 'day', value.day, defaults.day, 1, monthDays(year, month));
    const hour = validateItem(issues, 'hour', value.hour, defaults.hour, 0, 23);
    const minute = validateItem(issues, 'minute', value.minute, defaults.minute, 0, 59);
    const second = validateItem(issues, 'second', value.second, defaults.second, 0, 59);
    const ms = validateItem(issues, 'ms', value.ms, defaults.ms, 0, 999);

    let tz: TimeZone = { type: 'local' };

    if (value.tzutc) {
        if (value.tzutc.toLocaleUpperCase() === 'Z')
            tz = { type: 'utc' };
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
            tz = { type: 'offset', hour: tzhour, minute: tzminute };
    }

    return (issues.length) ? Result.failure(issues) : Result.success({ year, month, day, hour, minute, second, ms, tz });
};

const toDateType = (value: DateObject, type: DateType): DateObject => {
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
};

const toIsoString = (value: DateObject, full: boolean = false): string => {
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

    if (value.tz.type === 'utc') {
        result += 'Z';
    }
    else if (value.tz.type === 'offset') {
        const { hour, minute } = value.tz;

        result += (hour < 0 ? '-' : '+');

        result += Math.abs(hour).toFixed(0).padStart(2, '0');
        if (full || minute) {
            result += ':';
            result += minute.toFixed(0).padStart(2, '0');
        }
    }

    return result;
};

const parseDateObject = (value: string, format: RegExp | DateType = 'datetimeTz') => {
    const regexFormat = regex.resolve(format);

    const match = value.match(regexFormat);

    if (match) {
        const groups = match.groups ?? {};

        return DateObject.from(groups);
    }

    return Result.failure(`Does not match format ${format}`);
};

/**
 * Utility functions for working with DateObjects.
 */
export const DateObject = Object.seal({
    /**
     * Validates a raw date object and returns a Result object containing either the validated DateObject or validation issues.
     * @param value The raw date object to validate.
     * @returns A Result object containing the validated DateObject or validation issues.
     */
    from: validateRawObject,

    /**
     * Converts a DateObject to a DateObject of a specific type.
     * @param value The input DateObject.
     * @param type The type of date to convert to.
     * @returns The converted DateObject.
     */
    to: toDateType,

    /**
     * Converts a DateObject to an ISO string representation.
     * @param value The input DateObject.
     * @param full If true, includes time components in the ISO string.
     * @returns The ISO string representation of the DateObject.
     */
    toISO: toIsoString,

    /** Regular expressions for date and time formats */
    regex: regex,

    /**
     * Parses a string into a DateObject based on a specified format.
     * @param value The input string to parse.
     * @param format The format of the input string.
     * @returns A Result object containing either the parsed DateObject or an error message.
     */
    parse: parseDateObject
});