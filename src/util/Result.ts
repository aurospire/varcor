/**
 * Represents a successful result containing a value of type `T`.
 * @template T The type of the value.
 */
export type ResultSuccess<T> = { success: true; value: T; };

/**
 * Represents a failed result containing an error of type `F`.
 * @template F The type of the error.
 */
export type ResultFailure<F> = { success: false; error: F; };

/**
 * Represents a result that can either be a success or a failure.
 * @template T The type of the value in case of success.
 * @template F The type of the error in case of failure.
 */
export type Result<T, F> = ResultSuccess<T> | ResultFailure<F>;

/**
 * Utility functions for creating Result objects.
 */
export const Result = Object.freeze({
    /**
     * Creates a successful Result object with the given value.
     * @template T The type of the value.
     * @param value The value to be wrapped in the successful Result.
     * @returns A ResultSuccess object representing a successful result.
     */
    success: <T>(value: T): ResultSuccess<T> => ({ success: true, value }),

    /**
     * Creates a failed Result object with the given error.
     * @template F The type of the error.
     * @param error The error to be wrapped in the failed Result.
     * @returns A ResultFailure object representing a failed result.
     */
    failure: <F>(error: F): ResultFailure<F> => ({ success: false, error })
});
