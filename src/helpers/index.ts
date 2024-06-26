import { DateTime } from 'luxon';

import { DateObject, DateType, Result } from '@/util';
import { DataObject, DataObjectBuilder, FileOptions } from '@/data';
import {
    BooleanVariable, DateObjectVariable, EnumVariable, IntegerVariable,
    JsonValidator, JsonVariable, NumberVariable, StringVariable,
    Variable, parseValues, parseResults, InferValues
} from '@/variables';

/**
 * Creates a new instance of `NumberVariable` for parsing and validating numeric values.
 * @returns An instance of `NumberVariable`.
 */
const numberVar = () => new NumberVariable();

/**
 * Creates a new instance of `IntegerVariable` for parsing and validating integer values.
 * @returns An instance of `IntegerVariable`.
 */
const integerVar = () => new IntegerVariable();

/**
 * Creates a new instance of `StringVariable` for parsing and validating string values.
 * @returns An instance of `StringVariable`.
 */
const stringVar = () => new StringVariable();

/**
 * Creates a new instance of `BooleanVariable` for parsing and validating boolean values.
 * @returns An instance of `BooleanVariable`.
 */
const booleanVar = () => new BooleanVariable();

/**
 * Creates a new instance of `EnumVariable` for parsing and validating enumerated string values.
 * @returns An instance of `EnumVariable`.
 */
const enumVar = () => new EnumVariable();

/**
 * Creates a new instance of `EnumVariable` for parsing and validating enumerated string values.
 * @returns An instance of `EnumVariable`.
 */
const literalVar = <T extends string>(value: T) => new EnumVariable().value(value);

/**
 * Resolves and creates a `DateObjectVariable` for parsing and validating date objects based on a specific format.
 * @param from The format to use for parsing date objects, either a predefined `DateType` or a custom `RegExp`.
 * @returns An instance of `DateObjectVariable` configured with the specified format.
 */
const resolveDateType = (from?: RegExp | DateType): DateObjectVariable => new DateObjectVariable(undefined, DateObject.regex.resolve(from));

/**
 * Creates a new `DateObjectVariable` for parsing and validating date objects.
 * @param from Optional format or type for the date parsing.
 * @returns An instance of `DateObjectVariable`.
 */
const dateObjVar = (from?: RegExp | DateType) => resolveDateType(from);

/**
 * Creates a new `Variable` for parsing and validating JavaScript `Date` objects.
 * @param from Optional format or type for the date parsing.
 * @returns A `Variable` instance that produces JavaScript `Date` objects.
 */
const jsdateVar = (from?: RegExp | DateType): Variable<Date> => resolveDateType(from).transform(d =>
    Result.success<Date>(DateTime.fromISO(DateObject.toISO(d)).toJSDate())
);

/**
 * Creates a new `Variable` for parsing and validating `luxon` `DateTime` objects.
 * @param from Optional format or type for the date parsing.
 * @returns A `Variable` instance that produces `luxon` `DateTime` objects.
 */
const luxdateVar = (from?: RegExp | DateType): Variable<DateTime> => resolveDateType(from).transform(d =>
    Result.success<DateTime>(DateTime.fromISO(DateObject.toISO(d)))
);

/**
 * Creates a new `JsonVariable` for parsing and validating JSON objects.
 * @param validator Optional JSON validator function.
 * @returns A `JsonVariable` instance.
 */
const jsonVar = <T = any>(validator?: JsonValidator<T>) => validator ? new JsonVariable<T>().validate(validator) : new JsonVariable<T>();

/**
 * Utility functions for creating and manipulating data objects in various formats.
 */
const dataObj = Object.freeze({
    new: () => new DataObjectBuilder(),
    env: () => new DataObjectBuilder().env(),
    data: (data: DataObject | DataObjectBuilder) => new DataObjectBuilder().data(data),
    object: (data: Record<string, any>) => new DataObjectBuilder().object(data),
    json: (data: string) => new DataObjectBuilder().json(data),
    dotenv: (data: string) => new DataObjectBuilder().dotenv(data),
    jsonFile: (path: string, options?: FileOptions) => new DataObjectBuilder().jsonFile(path, options),
    dotenvFile: (path: string, options?: FileOptions) => new DataObjectBuilder().dotenvFile(path, options)
} as const);

/**
 * Utility functions for creating variables of different types.
 */
const varObj = Object.freeze({
    number: numberVar,
    integer: integerVar,
    string: stringVar,
    boolean: booleanVar,
    dateobj: dateObjVar,
    jsdate: jsdateVar,
    luxdate: luxdateVar,
    enum: enumVar,
    json: jsonVar,
} as const);

export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    dateObjVar as dateobj,
    jsdateVar as jsdate,
    luxdateVar as luxdate,
    enumVar as enum,
    literalVar as literal,
    jsonVar as json,    
    parseResults as results,
    parseValues as values,
    varObj as var,
    dataObj as data,
    InferValues as infer,
};

