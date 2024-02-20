import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Represents a boolean variable that can be parsed from a string.
 * This class extends the `Variable` class, specialized to handle boolean values.
 */
export class BooleanVariable extends Variable<boolean> {
    /**
     * Constructs a new `BooleanVariable` instance.
     * @param from An optional `BooleanVariable` instance to initialize from. This can be used to clone an existing variable.
     */
    constructor(from?: BooleanVariable) {
        super(from);
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string `'boolean'` representing the type of the variable.
     */
    override get type(): string {
        return 'boolean';
    }

    /**
     * Parses a string value into a boolean result.
     * The method matches against specific patterns to determine the boolean value.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed boolean value or an array of error messages if the parsing fails.
     */
    protected override  __parse(value: string): Result<boolean, string[]> {        
        const result = value.match(/^(?:(true|t|1)|(false|f|0))$/i);

        if (result)            
            return Result.success(result[1] ? true : false);
        else            
            return Result.failure(['must be a boolean (true|t|1)|(false|f|0)']);
    }

    /**
     * Creates a clone of the current `BooleanVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `BooleanVariable` instance with the same properties as the current one.
     */
    protected override  __clone(): BooleanVariable {
        return new BooleanVariable(this);
    }
}
