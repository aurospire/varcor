import { Result } from "@/util";
import { Variable } from "./Variable";

export type JsonValidator<T> = (data: any) => Result<T>;

export class JsonVariable<T = any> extends Variable<T> {

    #validator?: JsonValidator<T>;

    constructor(from?: JsonVariable<T>) {
        super(from);
    }

    override get type(): string {
        return 'Json';
    }

    validate<S>(validator: JsonValidator<S>): JsonVariable<S> {
        const newVar: JsonVariable<S> = this.__clone() as any;
        newVar.#validator = validator;
        return newVar;
    }

    protected override  __parse(value: string): Result<T> {
        try {
            const data = JSON.parse(value);

            return this.#validator?.(data) ?? Result.success(data as T);
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