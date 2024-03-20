import { DateTime } from 'luxon';
import { ZodType, ZodTypeDef } from 'zod';

import { DateObject, DateType, Result } from '@/util';
import { Settings, InferValues, InferResults } from '@/settings/Settings';
import { DataObject, DataObjectBuilder } from '@/data';
import {
    BooleanVariable, DateObjectVariable, EnumVariable, IntegerVariable,
    JsonValidator, JsonVariable, NumberVariable, StringVariable,
    Variable, VariableObject
} from '@/variables';
import { SettingsError } from '@/settings';

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
const dataObj = Object.seal({
    new: () => new DataObjectBuilder(),
    env: () => new DataObjectBuilder().addEnv(),
    obj: (data: Record<string, any>) => new DataObjectBuilder().addObject(data),
    json: (data: string) => new DataObjectBuilder().addJsonFormat(data),
    dotenv: (data: string) => new DataObjectBuilder().addDotEnvFormat(data),
});

/**
 * Utility functions for creating variables of different types.
 */
const varObj = Object.seal({
    number: numberVar,
    integer: integerVar,
    string: stringVar,
    boolean: booleanVar,
    dateobj: dateObjVar,
    jsdate: jsdateVar,
    luxdate: luxdateVar,
    enum: enumVar,
    json: jsonVar,
    tson: tsonVar,
});

/**
 * Retrieves the parsed result of a variable from the provided data object.
 * @template V The type of the variable.
 * @param {string} name The name of the variable in the data object.
 * @param {V} variable The variable to parse from the data object.
 * @param {DataObject} data The data object containing the variable's value.
 * @returns {InferResults<V>} The parsed result of the variable.
 */
const result = <V extends Variable<unknown>>(name: string, variable: V, data: DataObject = dataObj.env().toDataObject()): InferResults<V> => {
    return variable.parse(data[name]) as InferResults<V>;
};

/**
 * Retrieves the value of a variable from the provided data object.
 * Throws a SettingsError if parsing fails.
 * @template V The type of the variable.
 * @param {string} name The name of the variable in the data object.
 * @param {V} variable The variable to retrieve from the data object.
 * @param {DataObject} data The data object containing the variable's value.
 * @returns {InferValues<V>} The value of the variable.
 * @throws {SettingsError} If parsing fails.
 */
const value = <V extends Variable<unknown>>(name: string, variable: V, data: DataObject = dataObj.env().toDataObject()): InferValues<V> => {
    const result = variable.parse(data[name]);

    if (result.success)
        return result.value as InferValues<V>;
    else
        throw new SettingsError([{ key: name, issues: result.error }]);
};


export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    dateObjVar as dateobj,
    jsdateVar as jsdate,
    luxdateVar as luxdate,
    enumVar as enum,
    jsonVar as json,
    tsonVar as tson,
    result,
    value,
    varObj as var,
    dataObj as data,
    settings,
    InferValues as infer,
};

