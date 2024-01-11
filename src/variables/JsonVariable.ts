import { Result } from "@/util";
import { Variable } from "./Variable";

export class JsonVariable<T> extends Variable<T> {
    constructor(from?: JsonVariable<T>) {
        super(from);
    }

    override get type(): string {
        return 'Json';
    }

    protected override  __parse(value: string): Result<T> {
        try {
            const result = JSON.parse(value);

            return Result.success(result as T);
        }
        catch (error: any) {
            console.log(error);
            return Result.failure(error.message);
        }
    }

    protected override  __clone(): JsonVariable<T> {
        return new JsonVariable(this);
    }

}