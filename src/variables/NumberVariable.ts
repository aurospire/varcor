import { Result } from "@/util";
import { Variable } from "./Variable";

export class NumberVariable extends Variable<number> {
    #min?: number;

    #max?: number;

    constructor(from?: NumberVariable) {
        super(from);
        this.#min = (from ? from.#min : undefined);
        this.#max = (from ? from.#max : undefined);
    }

    override get type(): string {
        return 'number';
    }

    min(value: number): NumberVariable {
        const newVar = this.__clone();
        newVar.#min = value;
        return newVar;
    }

    max(value: number): NumberVariable {
        const newVar = this.__clone();
        newVar.#max = value;
        return newVar;
    }

    protected override  __parse(value: string): Result<number, string[]> {
        const min = this.#min ?? -Infinity;
        const max = this.#max ?? Infinity;

        let error: string = '';

        if (this.#min !== undefined)
            error = (this.#max !== undefined)
                ? `must be between ${min} and ${max}`
                : `must be greater than ${min}`;
        else
            error = `must be less than ${max}`;

        const result = Number.parseFloat(value);

        if (Number.isNaN(result))
            return Result.failure(['must be a number']);
        else if (result >= min && result <= max)
            return Result.success(result);
        else
            return Result.failure([error]);
    }

    protected override  __clone(): NumberVariable {
        return new NumberVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), min: this.#min, max: this.#max };
    }
}