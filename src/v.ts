import { IntegerVariable } from './variables/IntegerVariable';
import { EnumVariable } from './variables/EnumVariable';
import { NumberVariable } from './variables/NumberVariable';
import { StringVariable } from './variables/StringVariable';
import { BooleanVariable } from './variables/BooleanVariable';
import { DateObjectVariable } from './variables/DateObjectVariable';
import { InferObject } from './variables/Infer';
import { Result } from './variables';

const numberVar = () => new NumberVariable();
const integerVar = () => new IntegerVariable();
const stringVar = () => new StringVariable();
const booleanVar = () => new BooleanVariable();
const dateObjVar = () => new DateObjectVariable();
const dateVar = () => new DateObjectVariable().transform(d => Result.success<Date>(new Date(d.year, d.month, d.day, d.hour, d.minute, d.second, d.ms)));
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