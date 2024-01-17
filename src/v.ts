import { IntegerVariable } from './variables/IntegerVariable';
import { EnumVariable } from './variables/EnumVariable';
import { NumberVariable } from './variables/NumberVariable';
import { StringVariable } from './variables/StringVariable';
import { BooleanVariable } from './variables/BooleanVariable';
import { DateObjectVariable } from './variables/DateObjectVariable';
import { InferObject } from './variables/Infer';
import { Result } from './variables';
import { JsonValidator, JsonVariable } from './variables/JsonVariable';
import { ZodType, ZodTypeDef } from 'zod';
import { DateTime } from 'luxon';
import { DateObject, DateType } from './util';

const resolveDateType = (type?: RegExp | DateType): DateObjectVariable => {
    let regex: RegExp;

    if (type instanceof RegExp)
        regex = type;
    else
        switch (type) {
            case 'date':
                regex = DateObject.regex.date;
                break;
            case 'time':
                regex = DateObject.regex.time;
                break;
            case 'datetime':
                regex = DateObject.regex.datetime;
                break;
            case 'timeTz':
                regex = DateObject.regex.timeTz;
                break;
            default:
            case 'datetimeTz':
                regex = DateObject.regex.datetimeTz;
                break;
        }

    return new DateObjectVariable(undefined, regex);
};

const numberVar = () => new NumberVariable();

const integerVar = () => new IntegerVariable();

const stringVar = () => new StringVariable();

const booleanVar = () => new BooleanVariable();

const enumVar = () => new EnumVariable();

const dateObjVar = (from?: RegExp | DateType) => resolveDateType(from);

const jsdateVar = (from?: RegExp | DateType) => resolveDateType(from).transform(d =>
    Result.success<Date>(new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second, d.ms))
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
    InferObject as infer
};