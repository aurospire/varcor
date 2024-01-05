import { IntegerVariable } from './IntegerVariable';
import { EnumVariable } from './EnumVariable';
import { NumberVariable } from './NumberVariable';
import { StringVariable } from './StringVariable';
import { BooleanVariable } from './BooleanVariable';
import { DateVariable } from './DateVariable';
import { InferObject } from './Infer';

const numberVar = () => new NumberVariable();
const integerVar = () => new IntegerVariable();
const stringVar = () => new StringVariable();
const booleanVar = () => new BooleanVariable();
const dateVar = () => new DateVariable();
const enumVar = () => new EnumVariable();

export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    dateVar as date,
    enumVar as enum,
    InferObject as infer
};