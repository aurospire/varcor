import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Represents a variable that can parse numeric values from strings, with optional minimum and maximum constraints.
 * This class extends `Variable` to specifically handle numeric (floating-point and integer) values.
 */
export class NumberVariable extends Variable<number> {
    #min?: number;
    #max?: number;

    /**
     * Constructs a new `NumberVariable` instance.
     * @param from An optional `NumberVariable` instance to initialize from, allowing for cloning with inherited properties.
     */
    constructor(from?: NumberVariable) {
        super(from);
        this.#min = (from ? from.#min : undefined);
        this.#max = (from ? from.#max : undefined);
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string 'number' representing the type of the variable.
     */
    override get type(): string {
        return 'number';
    }

    /**
     * Sets the minimum acceptable value for the number and returns a new `NumberVariable` instance reflecting this change.
     * @param value The minimum value to set.
     * @returns A new `NumberVariable` instance with the specified minimum value.
     */
    min(value: number): NumberVariable {
        const newVar = this.__clone();
        newVar.#min = value;
        return newVar;
    }

    /**
     * Sets the maximum acceptable value for the number and returns a new `NumberVariable` instance reflecting this change.
     * @param value The maximum value to set.
     * @returns A new `NumberVariable` instance with the specified maximum value.
     */
    max(value: number): NumberVariable {
        const newVar = this.__clone();
        newVar.#max = value;
        return newVar;
    }

    /**
     * Parses a string value into a numeric value, validating against the optional minimum and maximum constraints.
     * @param value The string value to parse and validate.
     * @returns A `Result` instance containing the parsed number or an array of error messages if parsing fails or constraints are violated.
     */
    protected override __parse(value: string): Result<number, string[]> {
        const min = this.#min ?? -Infinity;
        const max = this.#max ?? Infinity;

        // Construct an appropriate error message based on the defined constraints.
        let error: string = this.#min !== undefined && this.#max !== undefined
                            ? `must be between ${min} and ${max}`
                            : this.#min !== undefined ? `must be greater than or equal to ${min}`
                            : this.#max !== undefined ? `must be less than or equal to ${max}`
                            : '';

        const result = Number.parseFloat(value);

        if (Number.isNaN(result))
            return Result.failure(['must be a number']);
        else if (result >= min && result <= max)
            return Result.success(result);
        else
            return Result.failure([error]);
    }

    /**
     * Creates a clone of the current `NumberVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `NumberVariable` instance with the same properties as the current one.
     */
    protected override __clone(): NumberVariable {
        return new NumberVariable(this);
    }

    /**
     * Returns an object representation of the variable, including its type, optionality, default value, and range constraints.
     * @returns An object containing the variable's properties.
     */
    protected override __object(): Record<string, any> {
        return { ...super.__object(), min: this.#min, max: this.#max };
    }
}
