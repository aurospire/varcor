import { Result } from "./Result";
import { Variable } from "./Variable";

export type StringValidator = (value: string) => Result<string>;

const makeValidator = (regex: RegExp): StringValidator => value => {
    const result = value.match(regex);

    if (result)
        return Result.success(result[0]);
    else
        return Result.failure(`must match ${regex}`);
};

export class StringVariable extends Variable<string> {
    #validators: StringValidator[];

    constructor(from?: StringVariable) {
        super(from);

        this.#validators = (from ? [...from.#validators] : []);
    }

    override get type(): string {
        return 'string';
    }

    validate(validator: StringValidator | RegExp): StringVariable {
        const newVar = this.__clone();
        newVar.#validators.push(validator instanceof RegExp ? makeValidator(validator) : validator);
        return newVar;
    }

    protected override  __parse(value: string): Result<string> {
        if (this.#validators.length) {
            const issues: string[] = [];

            for (const validator of this.#validators) {
                const result = validator(value);

                if (result.success)
                    return result;
                else
                    issues.push(...result.issues);
            }

            return Result.failure(issues);
        }
        else {
            return Result.success(value);
        }
    }

    protected override  __clone(): StringVariable {
        return new StringVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), validate: this.#validators };
    }
}