import { DateObject, Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Represents a variable that can parse date objects from strings based on specific formats.
 * This class extends `Variable` to handle `DateObject` types, allowing for custom date formats during parsing.
 */
export class DateObjectVariable extends Variable<DateObject> {
    #formats: RegExp[];

    /**
     * Constructs a new `DateObjectVariable` instance.
     * @param from An optional `DateObjectVariable` instance to initialize from, allowing for cloning.
     * @param formats A list of `RegExp` objects representing the formats to use for date parsing.
     */
    constructor(from?: DateObjectVariable, ...formats: RegExp[]) {
        super(from);

        this.#formats = formats.length ? formats : (from ? [...from.#formats] : [DateObject.regex.datetimeTz]);
    }

    /**
     * Adds or replaces the formats used for parsing date strings.
     * @param regex A single `RegExp` object or an array of them representing the new format(s) to use.
     * @param clear If `true`, existing formats are cleared and replaced with the new ones; otherwise, new formats are added to existing ones.
     * @returns A new `DateObjectVariable` instance with the updated formats.
     */
    format(regex: RegExp | RegExp[], clear: boolean = false): DateObjectVariable {
        if (regex instanceof RegExp) regex = [regex];

        const newVar = this.__clone();

        newVar.#formats = clear ? [...regex] : [...this.#formats, ...regex];

        return newVar;
    }

    /**
     * Overrides the `type` getter to return the type of the variable as a string.
     * @returns The string 'Date' representing the type of the variable.
     */
    override get type(): string {
        return 'Date';
    }

    /**
     * Parses a string value into a `DateObject` based on the defined formats.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed `DateObject` or an array of error messages if parsing fails.
     */
    protected override  __parse(value: string): Result<DateObject, string[]> {
        for (const format of this.#formats) {
            const result = DateObject.parse(value, format);

            if (result.success)
                return result;
        }

        return Result.failure([`must be in a valid date format.`]);
    }

    /**
     * Creates a clone of the current `DateObjectVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `DateObjectVariable` instance with the same properties as the current one.
     */
    protected override  __clone(): DateObjectVariable {
        return new DateObjectVariable(this, ...this.#formats);
    }

    /**
     * Returns an object representation of the variable, including its type, optionality, default value, and formats.
     * @returns An object containing the variable's properties.
     */
    protected __object(): Record<string, any> {
        return { ...super.__object(), formats: [...this.#formats] };
    }
}
