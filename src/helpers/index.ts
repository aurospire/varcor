import { DateTime } from 'luxon';
import { ZodType, ZodTypeDef } from 'zod';

import { DateObject, DateType, Result } from '@/util';
import { Settings, SettingsValues } from '@/settings/Settings';
import { DataObjectBuilder } from '@/data';
import {
    BooleanVariable, DateObjectVariable, EnumVariable, IntegerVariable,
    JsonValidator, JsonVariable, NumberVariable, StringVariable,
    Variable, VariableObject
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
const dateVar = (from?: RegExp | DateType): Variable<DateTime> => resolveDateType(from).transform(d =>
    Result.success<DateTime>(DateTime.fromISO(DateObject.toISO(d)))
);

/**
 * Creates a new `JsonVariable` for parsing and validating JSON objects.
 * @param validator Optional JSON validator function.
 * @returns A `JsonVariable` instance.
 */
const jsonVar = <T = any>(validator?: JsonValidator<T>) => validator ? new JsonVariable<T>().validate(validator) : new JsonVariable<T>();

/**
 * Creates a new `JsonVariable` for parsing and validating objects based on a `zod` schema.
 * @param type A `zod` schema for validation.
 * @returns A `JsonVariable` instance configured with the `zod` schema validation.
 */
const tsonVar = <Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(type: ZodType<Output, Def, Input>) => new JsonVariable<Output>().validate(data => {
    const result = type.safeParse(data);

    if (result.success)
        return Result.success(result.data);
    else
        return Result.failure(result.error.issues.map(issue => `${issue.path}: ${issue.message}`));
});

/**
 * Initializes a new `Settings` instance with a specified set of variables for parsing settings.
 * @param variables A map of setting names to `Variable` instances.
 * @returns A `Settings` instance configured with the specified variables.
 */
const settings = <V extends VariableObject>(variables: V): Settings<V> => new Settings<V>(variables);

/**
 * Utility functions for creating and manipulating data objects in various formats.
 */
const data = Object.seal({
    new: () => new DataObjectBuilder(),
    env: () => new DataObjectBuilder().addEnv(),
    obj: (data: Record<string, any>) => new DataObjectBuilder().addObject(data),
    strings: (data: Record<string, any>) => new DataObjectBuilder().addObject(data),
    json: (data: string) => new DataObjectBuilder().addJsonFormat(data)
});

/**
 * Utility functions for creating variables of different types.
 */
const vars = Object.seal({
    number: numberVar,
    integer: integerVar,
    string: stringVar,
    boolean: booleanVar,
    dateobject: dateObjVar,
    jsdate: jsdateVar,
    luxdate: dateVar,
    enum: enumVar,
    json: jsonVar,
    tson: tsonVar,
});

export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    dateObjVar as dateobject,
    jsdateVar as jsdate,
    dateVar as date,
    enumVar as enum,
    jsonVar as json,
    tsonVar as tson,
    vars as var,
    data,
    settings,
    SettingsValues as infer
};
