import { IntegerVariable } from './IntegerVariable';
import { EnumVariable } from './EnumVariable';
import { NumberVariable } from './NumberVariable';
import { StringVariable } from './StringVariable';
import { BooleanVariable } from './BooleanVariable';
import { Infer } from './Variable';

const numberVar = () => new NumberVariable();
const integerVar = () => new IntegerVariable();
const stringVar = () => new StringVariable();
const booleanVar = () => new BooleanVariable();
const enumVar = () => new EnumVariable();

export {
    numberVar as number,
    integerVar as integer,
    stringVar as string,
    booleanVar as boolean,
    enumVar as enum,
    integerVar as intger,
    Infer as infer
};