import { inspect } from "util";
import { Result } from "@/util";

/**
 * Defines a transformer function type that takes an input of type I and returns a `Result` of type O or string array (error messages).
 */
export type Transformer<I, O> = (value: I) => Result<O, string[]>;

/**
 * Represents a variable that can be parsed from a string.
 * The generic type `T` represents the type of the variable's value.
 */
export class Variable<T = never> {
    #optional: boolean;
    #default?: T;

    /**
     * Constructs a new `Variable` instance.
     * @param from An existing `Variable` instance or an object specifying the initial `optional` and `default` values.
     */
    constructor(from?: Variable<T> | { optional: boolean, default?: T; }) {
        this.#optional = from instanceof Variable ? from.#optional : (from?.optional ?? false);
        this.#default = from instanceof Variable ? from.#default : (from?.default ?? undefined);
    }

    /**
     * Parses a string value into a `Result` of type `T` or an array of error messages.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed value or error messages.
     */
    parse(value?: string | undefined): Result<T, string[]> {
        if (value !== undefined)
            return this.__parse(value);
        else {
            if (this.#optional)
                return Result.success(undefined) as Result<T, string[]>;
            else if (this.#default !== undefined)
                return Result.success(this.#default) as Result<T, string[]>;
            else
                return Result.failure(['is required']);
        }
    }

    /**
     * Returns whether the variable is optional.
     */
    get isOptional(): boolean {
        return this.#optional;
    }

    /**
     * Returns the default value of the variable, if any.
     */
    get default(): T | undefined {
        return this.#default;
    }

    /**
     * Returns the type of the variable as a string.
     * This is a placeholder method that should be overridden in subclasses.
     */
    get type(): string {
        return 'never';
    }

    /**
     * Parses a string value into a `Result` of type `T` or error messages.
     * This method should be overridden by subclasses to implement specific parsing logic.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed value or error messages.
     */
    protected __parse(value: string): Result<T, string[]> {
        return Result.failure(['must never exist']);
    }

    /**
     * Creates a clone of the current `Variable` instance.
     * This method is used internally to create modified copies of the variable.
     * @returns A new `Variable` instance with the same properties as the current one.
     */
    protected __clone(): Variable<T> {
        return new Variable<T>(this);
    }

    /**
     * Marks the variable as optional and returns a new `Variable` instance reflecting this change.
     * @returns A new `Variable` instance with `optional` set to `true`.
     */
    optional(): Variable<T | undefined> {
        const newVar = this.__clone();
        newVar.#optional = true;
        newVar.#default = undefined;
        return newVar;
    }

    /**
     * Sets a default value for the variable and returns a new `Variable` instance reflecting this change.
     * @param value The default value to set.
     * @returns A new `Variable` instance with the specified default value.
     */
    defaultTo(value: T): Variable<T> {
        const newVar = this.__clone();
        newVar.#optional = false;
        newVar.#default = value;
        return newVar;
    }

    /**
     * Combines the current variable with another variable, creating an `AggregateVariable`.
     * @param variable The variable to combine with the current variable.
     * @returns A new `AggregateVariable` instance representing the combination.
     */
    else<S>(variable: Variable<S>): Variable<T | S> {
        return new AggregateVariable<T | S>(this, variable);
    }

    /**
     * Transforms the variable using a specified transformer function and returns a new `Variable` instance.
     * @param transform The transformer function to apply to the variable's value.
     * @param type An optional string representing the type of the transformed variable.
     * @returns A new `Variable` instance with the transformation applied.
     */
    transform<S>(transform: Transformer<T, S>, type?: string): Variable<S> {
        return new TransformedVariable<S>(undefined, { from: this, transform, type });
    }

    /**
     * Returns an object representation of the variable, including its type, optionality, and default value.
     * @returns An object containing the variable's properties.
     */
    protected __object(): Record<string, any> {
        return {
            type: this.type,
            optional: this.isOptional,
            default: this.default,
        };
    }

    /**
     * Returns a string representation of the variable, including its properties.
     * @returns A string representation of the variable.
     */
    toString() {
        return inspect(this.__object(), { depth: null, colors: true });
    }
}

/**
 * Represents a variable that aggregates multiple variables, allowing for combined parsing logic.
 */
class AggregateVariable<T> extends Variable<T> {
    #variables: Variable<any>[] = [];

    /**
     * Constructs a new `AggregateVariable` instance.
     * @param from An optional `Variable` instance to initialize from.
     * @param variable An optional `Variable` instance to include in the aggregation.
     */
    constructor(from?: Variable<T>, variable?: Variable<any>) {
        super({
            optional: from?.isOptional || variable?.isOptional || false,
            default: from?.default || variable?.default
        });

        if (from instanceof AggregateVariable)
            this.#variables.push(...from.#variables);

        if (variable) {
            if (variable instanceof AggregateVariable)
                this.#variables.push(...variable.#variables);
            else
                this.#variables.push(variable);
        }
    }

    /**
     * Overrides the `type` getter to return a string representing the types of the aggregated variables.
     */
    override get type(): string {
        return this.#variables.map(v => v.type).join('/');
    }

    /**
     * Creates a clone of the current `AggregateVariable` instance.
     * @returns A new `AggregateVariable` instance with the same properties as the current one.
     */
    protected __clone(): Variable<T> {
        return new AggregateVariable<T>(this);
    }

    /**
     * Parses a string value using the parsing logic of the aggregated variables.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the parsed value or error messages.
     */
    protected __parse(value: string): Result<T, string[]> {
        const issues: string[] = [];

        for (const variable of this.#variables) {
            const result = variable.parse(value);
            if (result.success)
                return result;
            else
                issues.push(...result.error);
        }

        return Result.failure(issues);
    }
}

/**
 * Represents the data required to transform a variable's value using a transformer function.
 */
type TransformData<I, O> = { from: Variable<I>, transform: Transformer<I, O>, type?: string; };

/**
 * Represents a variable whose value is transformed using a specified transformer function.
 */
class TransformedVariable<T> extends Variable<T> {
    #data: TransformData<any, any>;

    /**
     * Constructs a new `TransformedVariable` instance.
     * @param from An optional `TransformedVariable` instance to initialize from.
     * @param data An optional `TransformData` object specifying the source variable, transformer function, and type.
     */
    constructor(from?: TransformedVariable<T>, data?: TransformData<any, any>) {
        super(from);

        if (data)
            this.#data = data;
        else if (from)
            this.#data = from.#data;
        else
            this.#data = { from: new Variable<any>(), transform: () => { throw new Error('Invalid transform'); } };
    }

    /**
     * Overrides the `type` getter to return a string representing the transformation from the source type to the target type.
     */
    override get type(): string {
        return `{${this.#data.from.type}->${this.#data.type ?? '?'}}`;
    }

    /**
     * Parses a string value, transforming it using the specified transformer function if the parse is successful.
     * @param value The string value to parse.
     * @returns A `Result` instance containing the transformed value or error messages.
     */
    override parse(value?: string | undefined): Result<T, string[]> {
        if (value === undefined && (this.isOptional || this.default !== undefined))
            return super.parse(value);

        const result = this.#data.from.parse(value);

        return result.success ? this.#data.transform(result.value) : result;
    }

    /**
     * Returns an object representation of the transformed variable, including properties from the base variable and transformation data.
     * @returns An object containing the transformed variable's properties.
     */
    protected __object(): Record<string, any> {
        return { ...super.__object, from: this.#data.from, type: this.#data.type };
    }
}
