import { Result } from "@/util";
import { Variable } from "./Variable";

export class BooleanVariable extends Variable<boolean> {
    constructor(from?: BooleanVariable) {
        super(from);
    }

    override get type(): string {
        return 'boolean';
    }

    protected override  __parse(value: string): Result<boolean> {
        const result = value.match(/^(?:(true|t|1)|(false|f|0))$/i);

        if (result)
            return Result.success(result[1] ? true : false);
        else
            return Result.failure('must be a boolean (true|t|1)|(false|f|0)');
    }

    protected override  __clone(): BooleanVariable {
        return new BooleanVariable(this);
    }

}