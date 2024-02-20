import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Defines a validator function type for string values, which returns a `Result` containing the validated string or an array of error messages.
 */
export type StringValidator = (value: string) => Result<string, string[]>;

/**
 * Validates a string value against a given regular expression and returns a `Result`.
 * @param value The string value to validate.
 * @param regex The regular expression to validate against.
 * @returns A `Result` instance containing the matched string or an error message.
 */
const validateRegex = (value: string, regex: RegExp): Result<string, string[]> => {
    const result = value.match(regex);

    if (result)
        return Result.success(result[0]);
    else
        return Result.failure([`must match ${regex}`]);
};

/**
 * Represents a variable that can handle and validate string values.
 * This class extends `Variable` to allow for custom validation of string inputs using validators or regular expressions.
 */
export class StringVariable extends Variable<string> {
    #validators: (StringValidator | RegExp)[];

    /**
     * Constructs a new `StringVariable` instance.
     * @param from An optional `StringVariable` instance to initialize from, allowing for cloning with inherited validators.
     */
    constructor(from?: StringVariable) {
        super(from);

        this.#validators = (from ? [...from.#validators] : []);
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string 'string' representing the type of the variable.
     */
    override get type(): string {
        return 'string';
    }

    /**
     * Adds a validator or regular expression to the list of validators for the string variable and returns a new instance.
     * @param validator A `StringValidator` function or a `RegExp` instance to use for validation.
     * @returns A new `StringVariable` instance with the added validator.
     */
    validate(validator: StringValidator | RegExp): StringVariable {
        const newVar = this.__clone();
        newVar.#validators.push(validator);
        return newVar;
    }

    /**
     * Parses and validates a string value using the set validators and/or regular expressions.
     * @param value The string value to parse and validate.
     * @returns A `Result` instance containing the validated string or an array of error messages if validation fails.
     */
    protected override __parse(value: string): Result<string, string[]> {
        if (this.#validators.length) {
            const issues: string[] = [];

            for (const validator of this.#validators) {
                const result = validator instanceof RegExp ? validateRegex(value, validator) : validator(value);

                if (!result.success) {
                    issues.push(...result.error);
                    console.log(result.error, issues)
                }
            }

            return issues.length > 0 ? Result.failure(issues) : Result.success(value);
        }
        else {
            return Result.success(value);
        }
    }

    /**
     * Creates a clone of the current `StringVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `StringVariable` instance with the same properties as the current one.
     */
    protected override __clone(): StringVariable {
        return new StringVariable(this);
    }

    /**
     * Returns an object representation of the variable, including its type, optionality, default value, and validators.
     * @returns An object containing the variable's properties.
     */
    protected override __object(): Record<string, any> {
        return { ...super.__object(), validators: [...this.#validators] };
    }
}
