import { IntegerVariable } from './IntegerVariable';
import { EnumVariable } from './EnumVariable';
import { NumberVariable } from './NumberVariable';
import { StringVariable } from './StringVariable';
import { BooleanVariable } from './BooleanVariable';

export * from './Result';
export * from './Variable';
export * from './NumberVariable';

export const v = Object.seal({
    number: () => new NumberVariable(),
    integer: () => new IntegerVariable(),
    string: () => new StringVariable(),
    boolean: () => new BooleanVariable(),
    enum: () => new EnumVariable()
} as const);

