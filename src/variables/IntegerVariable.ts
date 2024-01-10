import { Result } from "@/util";
import { Variable } from "./Variable";

export class IntegerVariable extends Variable<number> {
    #min?: number;

    #max?: number;

    constructor(from?: IntegerVariable) {
        super(from);
        this.#min = (from ? from.#min : undefined);
        this.#max = (from ? from.#max : undefined);
    }

    override get type(): string {
        return 'integer';
    }

    min(value: number): IntegerVariable {
        const newVar = this.__clone();
        newVar.#min = Math.ceil(value);
        return newVar;
    }

    max(value: number): IntegerVariable {
        const newVar = this.__clone();
        newVar.#max = value;
        return newVar;
    }

    protected override  __parse(value: string): Result<number> {
        const min = this.#min || -Infinity;
        const max = this.#max || Infinity;

        let error: string = '';

        if (this.#min !== undefined)
            error = (this.#max !== undefined)
                ? `must be between ${min} and ${max}`
                : `must be greater than ${min}`;
        else
            error = `must be less than ${max}`;

        const result = value.match(/^(?:([0-9]+)|(?:0b([01]+))|(?:0x([0-9A-F]+)))$/i);

        if (!result)
            return Result.failure('must be an integer');
        else {
            const integer = Number.parseInt(result[1] ?? result[2] ?? result[3], result[1] ? 10 : result[2] ? 2 : 16);

            if (integer >= min && integer <= max)
                return Result.success(integer);
            else
                return Result.failure(error);
        }

    }

    protected override  __clone(): IntegerVariable {
        return new IntegerVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), min: this.#min, max: this.#max };
    }
}