import { Result } from "./Result";
import { Variable } from "./Variable";

export class DateVariable extends Variable<Date> {
    constructor(from?: DateVariable) {
        super(from);
    }

    override get type(): string {
        return 'Date';
    }

    protected override  __parse(value: string): Result<Date> {
        return Result.failure('')
    }

    protected override  __clone(): DateVariable {
        return new DateVariable(this);
    }

}