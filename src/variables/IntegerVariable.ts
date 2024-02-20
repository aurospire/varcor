import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Represents a variable that can parse integer values from strings, with optional minimum and maximum constraints.
 * This class extends `Variable` to handle numbers, specifically integers, with support for setting range limits.
 */
export class IntegerVariable extends Variable<number> {
    #min?: number;
    #max?: number;

    /**
     * Constructs a new `IntegerVariable` instance.
     * @param from An optional `IntegerVariable` instance to initialize from, allowing for cloning with inherited properties.
     */
    constructor(from?: IntegerVariable) {
        super(from);
        this.#min = (from ? from.#min : undefined);
        this.#max = (from ? from.#max : undefined);
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string 'integer' representing the type of the variable.
     */
    override get type(): string {
        return 'integer';
    }

    /**
     * Sets the minimum acceptable value for the integer and returns a new `IntegerVariable` instance reflecting this change.
     * @param value The minimum value to set.
     * @returns A new `IntegerVariable` instance with the specified minimum value.
     */
    min(value: number): IntegerVariable {
        const newVar = this.__clone();
        newVar.#min = Math.ceil(value); // Ensure the minimum is an integer by rounding up.
        return newVar;
    }

    /**
     * Sets the maximum acceptable value for the integer and returns a new `IntegerVariable` instance reflecting this change.
     * @param value The maximum value to set.
     * @returns A new `IntegerVariable` instance with the specified maximum value.
     */
    max(value: number): IntegerVariable {
        const newVar = this.__clone();
        newVar.#max = Math.floor(value); // Ensure the maximum is an integer by rounding down.
        return newVar;
    }

    /**
     * Parses a string value into an integer, validating against the optional minimum and maximum constraints.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed integer or an array of error messages if parsing fails or constraints are violated.
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

        // Match against valid integer formats: decimal, binary (0b prefix), and hexadecimal (0x prefix).
        const result = value.match(/^(?:([0-9]+)|(?:0b([01]+))|(?:0x([0-9A-F]+)))$/i);

        if (!result)
            return Result.failure(['must be an integer']);
        else {
            // Parse the integer from the matched group in the appropriate base.
            const integer = Number.parseInt(result[1] ?? result[2] ?? result[3], result[1] ? 10 : result[2] ? 2 : 16);

            if (integer >= min && integer <= max)
                return Result.success(integer);
            else
                return Result.failure([error]);
        }
    }

    /**
     * Creates a clone of the current `IntegerVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `IntegerVariable` instance with the same properties as the current one.
     */
    protected override __clone(): IntegerVariable {
        return new IntegerVariable(this);
    }

    /**
     * Returns an object representation of the variable, including its type, optionality, default value, and range constraints.
     * @returns An object containing the variable's properties.
     */
    protected override __object(): Record<string, any> {
        return { ...super.__object(), min: this.#min, max: this.#max };
    }
}
