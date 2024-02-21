import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Defines a validator function type for string values, which returns a `Result` containing the validated string or an array of error messages.
 */
export type StringValidator = (value: string) => Result<string, string[]>;

const urlValidator: StringValidator = function url(value: string): Result<string, string[]> {
    try {
        const url = new URL(value);

        return Result.success(value);
    }
    catch (error: any) {
        return Result.failure([error.message]);
    }
};

const regexValidator = (regex: RegExp, error: string) => (value: string): Result<string, string[]> => {
    const result = value.match(regex);

    if (result)
        return Result.success(result[0]);
    else
        return Result.failure([error]);
};

/**
 * Represents a variable that can handle and validate string values.
 * This class extends `Variable` to allow for custom validation of string inputs using validators or regular expressions.
 */
export class StringVariable extends Variable<string> {
    #validators: StringValidator[];

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

    #validate(validator: StringValidator): StringVariable {
        const newVar = this.__clone();

        newVar.#validators.push(validator);

        return newVar;
    }

    /**
     * Adds a validator to the list of validators for the string variable and returns a new instance.
     * @param validator A `StringValidator` function to use for validation.
     * @param name An optional string to name the added StringValidator function.
     * @returns A new `StringVariable` instance with the added validator.
     */
    validate(validator: StringValidator, name?: string): StringVariable {
        const result = name ? { [name]: (value: string) => validator(value) }[name] : validator;

        return this.#validate(result);
    }

    /**
     * Adds a regex validator to the list of validators for the string variable and returns a new instance.
     * @param validator A  `RegExp` instance to use for validation.
     * @param name An optional string to name the added StringValidator function.
     * @returns A new `StringVariable` instance with the added validator.
     */
    regex(regex: RegExp, name?: string, error?: string) {
        const vname: string = name || regex.toString();

        const vregex = regexValidator(regex, error || `must be ${name}`);

        const result = { [vname]: (value: string) => vregex(value) }[vname];

        return this.#validate(result);
    }

    /**
     * Adds a uuid validator to the list of validators for the string variable and returns a new instance.     
     * @returns A new `StringVariable` instance with the added validator.
     */
    uuid(): StringVariable {
        return this.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'uuid', 'must be a uuid');
    }

    /**
     * Adds a email validator to the list of validators for the string variable and returns a new instance.     
     * @returns A new `StringVariable` instance with the added validator.
     */
    email(): StringVariable {
        return this.regex(/^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, 'email', 'must be an email');
    }

    /**
     * Adds a url validator to the list of validators for the string variable and returns a new instance.     
     * @returns A new `StringVariable` instance with the added validator.
     */
    url(): StringVariable {
        return this.#validate(urlValidator);
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
                const result = validator(value);

                if (result.success) {
                    return result;
                }
                else {
                    issues.push(...result.error);
                    //console.log(result.error, issues, this.#validators);
                }
            }

            return Result.failure(issues);
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
