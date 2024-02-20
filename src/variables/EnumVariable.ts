import { Result } from "@/util";
import { Variable } from "./Variable";

/**
 * Represents a variable that can only take a specified set of string values (an enumeration).
 * This class extends `Variable` to handle enumeration of string values with optional case sensitivity.
 */
export class EnumVariable<T extends string | never = never> extends Variable<T> {
    #items: string[];
    #insensitive: boolean;

    /**
     * Constructs a new `EnumVariable` instance.
     * @param from An optional `EnumVariable` instance to initialize from, allowing for cloning with inherited properties.
     */
    constructor(from?: EnumVariable<T>) {
        super(from);

        this.#items = (from ? [...from.#items] : []);
        this.#insensitive = (from ? from.#insensitive : false);
    }

    /**
     * Overrides the `type` getter to return a string representing the enumeration of possible values.
     * @returns A string representation of the enum values or 'never' if there are no items.
     */
    override get type(): string {
        return this.#items.map(i => `'${i}'`).join('/') || 'never';
    }

    /**
     * Marks the variable as case insensitive and returns a new `EnumVariable` instance reflecting this change.
     * @returns A new `EnumVariable` instance with case insensitivity enabled.
     */
    insensitive(): Variable<T> {
        const newVar = this.__clone();
        newVar.#insensitive = true;
        return newVar;
    }

    /**
     * Marks the variable as case sensitive and returns a new `EnumVariable` instance reflecting this change.
     * @returns A new `EnumVariable` instance with case sensitivity enabled.
     */
    sensitive(): Variable<T> {
        const newVar = this.__clone();
        newVar.#insensitive = false;
        return newVar;
    }

    /**
     * Adds a new possible value to the enumeration and returns a new `EnumVariable` instance.
     * @param value The new value to add to the enumeration.
     * @returns A new `EnumVariable` instance including the new value.
     */
    value<S extends string>(value: S): EnumVariable<S | T> {
        const newVar = this.__clone();
        newVar.#items.push(value);
        return newVar;
    }

    /**
     * Parses a string value to determine if it matches one of the enumerated values.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the matched enumeration value or an array of error messages if the match fails.
     */
    protected override  __parse(value: string): Result<T, string[]> {
        let index: number;

        if (this.#insensitive)
            index = this.#items.map(i => i.toLocaleLowerCase()).indexOf(value.toLocaleLowerCase());
        else
            index = this.#items.indexOf(value);

        if (index !== -1)
            return Result.success(this.#items[index] as T);
        else
            return Result.failure([this.#items.length === 0 ? `must never exist` : `must be of ${this.type}`]);
    }

    /**
     * Creates a clone of the current `EnumVariable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `EnumVariable` instance with the same properties as the current one.
     */
    protected override  __clone(): EnumVariable<T> {
        return new EnumVariable(this);
    }

    /**
     * Returns an object representation of the variable, including its enumeration values and case sensitivity.
     * @returns An object containing the variable's properties.
     */
    protected override __object(): Record<string, any> {
        return { ...super.__object(), items: [...this.#items], insensitive: this.#insensitive };
    }
}
