export type ResultSuccess<T> = { success: true; value: T; };

export type ResultFailure<F> = { success: false; error: F; };

export type Result<T, F> = ResultSuccess<T> | ResultFailure<F>;

export const Result = Object.seal({
    success: <T>(value: T): ResultSuccess<T> => ({ success: true, value }),
    failure: <F>(error: F): ResultFailure<F> => ({ success: false, error })
});
