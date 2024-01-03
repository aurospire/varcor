import { Result } from "./Result";
import { Variable } from "./Variable";

export class StringVariable extends Variable<string> {
    #validate?: RegExp;

    constructor(from?: StringVariable) {
        super(from);

        this.#validate = (from ? from.#validate : undefined);
    }

    override get type(): string {
        return 'string';
    }

    validate(regexp: RegExp): StringVariable {
        const newVar = this.__clone();
        newVar.#validate = regexp;
        return newVar;
    }

    protected override  __process(value: string): Result<string> {
        if (this.#validate) {
            const result = value.match(this.#validate);

            if (result)
                return Result.success(result[0]);
            else
                return Result.failure(`must match ${this.#validate}`);
        }
        else {
            return Result.success(value);
        }
    }

    protected override  __clone(): StringVariable {
        return new StringVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), validate: this.#validate };
    }
}