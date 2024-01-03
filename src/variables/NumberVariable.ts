import { Result } from "./Result";
import { Variable } from "./Variable";

export class NumberVariable extends Variable<number> {
    #min?: number;

    #max?: number;

    constructor(from?: NumberVariable) {
        super(from);
        this.#min = (from ? from.#min : undefined);
        this.#max = (from ? from.#max : undefined);
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

    protected override  __process(value: string): Result<number> {
        return Result.failure('');
    }

    protected override  __clone(): NumberVariable {
        return new NumberVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), min: this.#min, max: this.#max };
    }
}