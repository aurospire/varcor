import { IntegerVariable } from '@/variables/IntegerVariable';
import { EnumVariable } from '@/variables/EnumVariable';
import { NumberVariable } from '@/variables/NumberVariable';
import { StringVariable } from '@/variables/StringVariable';
import { BooleanVariable } from '@/variables/BooleanVariable';
import { DateObjectVariable } from '@/variables/DateObjectVariable';
import { JsonValidator, JsonVariable } from '@/variables/JsonVariable';
import { ZodType, ZodTypeDef } from 'zod';
import { DateTime } from 'luxon';
import { DateObject, DateType, Result } from '@/util';
import { Settings, SettingsValues } from '@/settings/Settings';
import { VariableObject } from '..';
import { Data } from '@/data';



const numberVar = () => new NumberVariable();

const integerVar = () => new IntegerVariable();

const stringVar = () => new StringVariable();

const booleanVar = () => new BooleanVariable();

const enumVar = () => new EnumVariable();


const resolveDateType = (from?: RegExp | DateType): DateObjectVariable => new DateObjectVariable(undefined, DateObject.regex.resolve(from));

const dateObjVar = (from?: RegExp | DateType) => resolveDateType(from);

const jsdateVar = (from?: RegExp | DateType) => resolveDateType(from).transform(d =>
    Result.success<Date>(DateTime.fromISO(DateObject.toISO(d)).toJSDate())
);


const dateVar = (from?: RegExp | DateType) => resolveDateType(from).transform(d =>
    Result.success<DateTime>(DateTime.fromISO(DateObject.toISO(d)))
);


const jsonVar = <T = any>(validator?: JsonValidator<T>) => validator ? new JsonVariable<T>().validate(validator) : new JsonVariable<T>();

const tsonVar = <Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(type: ZodType<Output, Def, Input>) => new JsonVariable<Output>().validate(data => {
    const result = type.safeParse(data);

    if (result.success)
        return Result.success(result.data);
    else
        return Result.failure(result.error.issues.map(issue => `${issue.path}: ${issue.message}`));
});

const settings = <V extends VariableObject>(variables: V): Settings<V> => new Settings<V>(variables);

const data = () => new Data();

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
    data,
    settings,
    SettingsValues as infer
};