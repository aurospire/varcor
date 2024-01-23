export type ResultSuccess<T> = { success: true; value: T; };

export type ResultFailure = { success: false; issues: string[]; };

export type Result<T> = ResultSuccess<T> | ResultFailure;

export const Result = Object.seal({
    success: <T>(value: T): ResultSuccess<T> => ({ success: true, value }),
    failure: (issues: string | string[]): ResultFailure => ({ success: false, issues: Array.isArray(issues) ? issues : [issues] })
});