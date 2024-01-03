import { NumberVariable } from './NumberVariable';

export * from './Result';
export * from './Variable';
export * from './NumberVariable';

export const v = Object.seal({
    number: () => new NumberVariable()
} as const);

