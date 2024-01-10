import { IntegerVariable } from './variables/IntegerVariable';
import { EnumVariable } from './variables/EnumVariable';
import { NumberVariable } from './variables/NumberVariable';
import { StringVariable } from './variables/StringVariable';
import { BooleanVariable } from './variables/BooleanVariable';
import { DateObjectVariable } from './variables/DateObjectVariable';
import { InferObject } from './variables/Infer';
import { Result } from './variables';

const resolveDateType = (type?: RegExp | 'date' | 'time' | 'datetime' | 'timeTz' | 'datetimeTz'): DateObjectVariable => {
    let regex: RegExp;

    if (type instanceof RegExp)
        regex = type;
    else
        switch (type) {
            case 'date':
                regex = DateObjectVariable.date;
            case 'time':
                regex = DateObjectVariable.time;
            case 'datetime':
                regex = DateObjectVariable.datetime;
            case 'timeTz':
                regex = DateObjectVariable.timeTz;
            default:
            case 'datetimeTz':
                regex = DateObjectVariable.datetimeTz;
        }

    return new DateObjectVariable(undefined, regex);
};

const numberVar = () => new NumberVariable();
const integerVar = () => new IntegerVariable();
const stringVar = () => new StringVariable();
const booleanVar = () => new BooleanVariable();
const dateObjVar = (from?: RegExp | 'date' | 'datetime' | 'datetimeTz' | 'time' | 'timeTz') => resolveDateType(from);
const dateVar = (from?: RegExp | 'date' | 'datetime' | 'datetimeTz' | 'time' | 'timeTz') => resolveDateType(from).transform(d =>
    Result.success<Date>(new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second, d.ms))
);
const enumVar = () => new EnumVariable();

export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    dateObjVar as dateObject,
    dateVar as date,
    enumVar as enum,
    InferObject as infer
};