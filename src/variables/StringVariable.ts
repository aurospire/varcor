import { Result } from "@/util";
import { Variable } from "./Variable";

export type StringValidator = (value: string) => Result<string, string[]>;

const validateRegex = (value: string, regex: RegExp) => {
    const result = value.match(regex);

    if (result)
        return Result.success(result[0]);
    else
        return Result.failure(`must match ${regex}`);
};

export class StringVariable extends Variable<string> {
    #validators: (StringValidator | RegExp)[];

    constructor(from?: StringVariable) {
        super(from);

        this.#validators = (from ? [...from.#validators] : []);
    }

    override get type(): string {
        return 'string';
    }

    validate(validator: StringValidator | RegExp): StringVariable {
        const newVar = this.__clone();
        newVar.#validators.push(validator);
        return newVar;
    }

    protected override  __parse(value: string): Result<string, string[]> {
        if (this.#validators.length) {
            const issues: string[] = [];

            for (const validator of this.#validators) {
                const result = validator instanceof RegExp ? validateRegex(value, validator) : validator(value);

                if (result.success)
                    return result;
                else
                    issues.push(...result.error);
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
        return { ...super.__object(), validate: [...this.#validators] };
    }
}