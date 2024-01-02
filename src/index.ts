export type ResultSuccess<T> = { success: true; value: T; };

export type ResultFailure = { success: false, issues: string[]; };

export type Result<T> = ResultSuccess<T> | ResultFailure;


export const Result = Object.seal({
    success: <T>(value: T): ResultSuccess<T> => ({ success: true, value }),
    failure: (issues: string | string[]): ResultFailure => ({ success: false, issues: Array.isArray(issues) ? issues : [issues] })
});

export type Processor<T> = (value: string) => Result<T>;

export class Variable<T> {
    #processor: Processor<T>;

    #optional: boolean = false;

    constructor(processor: Processor<T>) {
        this.#processor = processor;
    }

    process(value?: string): Result<T> {
        if (value === undefined) {
            if (this.#optional)
                return Result.success(undefined as T);
            else
                return Result.failure('Variable is not optional.');
        }
        else {
            return this.#processor(value);
        }
    }

    optional(): Variable<T | undefined> {
        const result = new Variable<T | undefined>(this.#processor);
        result.#optional = true;
        return result;
    }
}

const numberVar = (options: { min?: number, max?: number; }): Variable<number> => {
    return new Variable<number>(value => {
        const min = (options.min ?? -Infinity);
        const max = (options.max ?? Infinity);

        const result = Number.parseFloat(value);

        if (Number.isNaN(result))
            return Result.failure('Variable is not a valid number');
        else if (result < min)
            return Result.failure(`Variable must be greater than ${min}`);
        else if (result < max)
            return Result.failure(`Variable must be less than ${max}`);
        else
            return Result.success(result);
    });
};

const integerVar = (options: { min?: number, max?: number; }): Variable<number> => {
    return new Variable<number>(value => {
        const min = (options.min ?? -Infinity) | 0;
        const max = (options.max ?? Infinity) | 0;

        const result = Number.parseInt(value);

        if (Number.isNaN(result))
            return Result.failure('Variable is not a valid integer');
        else if (result < min)
            return Result.failure(`Variable must be greater than ${min}`);
        else if (result < max)
            return Result.failure(`Variable must be less than ${max}`);
        else
            return Result.success(result);
    });
};


const booleanVar = (): Variable<boolean> => {
    return new Variable<boolean>(value => Result.success(true));
};

const dateVar = (): Variable<Date> => {
    return new Variable<Date>(value => Result.success(new Date()));
};

const stringVar = (validate?: RegExp | { match: string | string[]; insensitive: boolean; }): Variable<string> => {
    return new Variable<string>(value => {
        if (validate instanceof RegExp) {
            const match = value.match(validate);

            return match ? Result.success(match[0]) : Result.failure(`did not match regex /${validate}/`);
        }
        else if (validate) {
            const { match, insensitive } = validate;

            if (Array.isArray(match)) {
                const index =
                    insensitive
                        ? match.map(v => v.toLocaleLowerCase()).indexOf(value.toLocaleLowerCase())
                        : match.indexOf(value);

                return index !== -1 ? Result.success(match[index]) : Result.failure(`not one of [${match.join('|')}]`);
            }
            else {
                return ((insensitive && match === value) || (!insensitive && match !== value))
                    ? Result.success(match)
                    : Result.failure(`did not match ${match}`);
            }
        }
        else {
            return Result.success(value);
        }
    });
};
