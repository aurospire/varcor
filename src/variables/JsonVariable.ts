import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Defines a validator function type for JSON data, which returns a `Result` containing the validated data of type `T` or an array of error messages.
 */
export type JsonValidator<T> = (data: any) => Result<T, string[]>;

/**
 * Represents a variable that can parse JSON values from strings, with support for custom validation.
 * This class extends `Variable` to handle JSON data, allowing for the specification of a validator function to validate the parsed JSON.
 */
export class JsonVariable<T = any> extends Variable<T> {
    #validator?: JsonValidator<T>;

    /**
     * Constructs a new `JsonVariable` instance.
     * @param from An optional `JsonVariable` instance to initialize from, allowing for cloning with inherited properties.
     */
    constructor(from?: JsonVariable<T>) {
        super(from);
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string 'Json' representing the type of the variable.
     */
    override get type(): string {
        return 'Json';
    }

    /**
     * Specifies a validator function for the JSON variable and returns a new `JsonVariable` instance with the validator applied.
     * @param validator A `JsonValidator` function to validate the parsed JSON data.
     * @returns A new `JsonVariable` instance of type `S` with the specified validator function.
     */
    validate<S>(validator: JsonValidator<S>): JsonVariable<S> {
        const newVar: JsonVariable<S> = this.__clone() as any; // Clone the current instance and apply the new validator.
        newVar.#validator = validator;
        return newVar;
    }

    /**
     * Parses a string value into JSON and validates it using the optionally specified validator function.
     * @param value The string value to parse and validate.
     * @returns A `Result` instance containing the validated JSON data of type `T` or an array of error messages.
     */
    protected override __parse(value: string): Result<T, string[]> {
        try {
            const data = JSON.parse(value);
            
            return this.#validator?.(data) ?? Result.success(data as T);
        }
        catch (error: any) {
            return Result.failure([`Invalid JSON: ${error.message}`]);
        }
    }

    /**
     * Creates a clone of the current `JsonVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `JsonVariable` instance with the same properties as the current one.
     */
    protected override __clone(): JsonVariable<T> {
        const clone = new JsonVariable(this);
        clone.#validator = this.#validator;
        return clone;
    }
}
