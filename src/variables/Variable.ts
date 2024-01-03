import { inspect } from "util";
import { Result, Value } from "./Result";

export type Infer<V> = V extends Variable<infer T> ? T : never;

export class Variable<T = never> {
    #optional: boolean;
    #default?: T;
    #description: string[];

    constructor(from?: Variable<T> | { optional: boolean, default?: T, description?: string[]; }) {

        this.#optional = from instanceof Variable ? from.#optional : (from?.optional ?? false);
        this.#default = from instanceof Variable ? from.#default : (from?.default ?? undefined);
        this.#description = from instanceof Variable ? from.#description : (from?.description ?? []);
    }

    process(value?: string | undefined): Result<T> {
        if (value)
            return this.__process(value);
        else {
            if (this.#optional)
                return Result.success(undefined) as Result<T>;
            else if (this.#default !== undefined)
                return Result.success(this.#default) as Result<T>;
            else
                return Result.failure('is required');
        }
    }

    get isOptional(): boolean {
        return this.#optional;
    }

    get default(): T | undefined {
        return this.#default;
    }

    get description(): string[] {
        return this.__description();
    }

    get type(): string {
        return 'never';
    }


    protected __process(value: string): Result<T> {
        return Result.failure('must never exist');
    }

    protected __clone(): Variable<T> {
        return new Variable<T>(this);
    }

    protected __description(): string[] {
        return this.#description;
    }

    optional(): Variable<T | undefined> {
        const newVar = this.__clone();
        newVar.#optional = true;
        newVar.#default = undefined;
        return newVar;
    }

    defaultTo(value: T): Variable<T> {
        const newVar = this.__clone();
        newVar.#optional = false;
        newVar.#default = value;
        return newVar;
    }

    describe(value: string): Variable<T> {
        const newVar = this.__clone();
        newVar.#description = [...this.#description, value];
        return newVar;
    }

    or<S>(variable: Variable<S>): Variable<T | S> {
        return new AggregateVariable<T | S>(this, variable);
    }

    protected __object(): Record<string, any> {
        return {
            type: this.type,
            optional: this.isOptional,
            default: this.default,
            description: this.description
        };
    }

    toString() {
        return inspect(this.__object(), { depth: null, colors: true });
    }
}

class AggregateVariable<T> extends Variable<T> {
    #variables: Variable<any>[] = [];

    constructor(from?: Variable<T>, variable?: Variable<any>) {
        super({
            optional: from?.isOptional || variable?.isOptional || false,
            default: from?.default || variable?.default
        });

        let result = this;

        if (from instanceof AggregateVariable)
            result.#variables.push(...this.#variables);

        if (variable)
            result.#variables.push(variable);
    }

    override get type(): string {
        return this.#variables.map(v => v.type).join('|');
    }

    protected __clone(): Variable<T> {
        return new AggregateVariable<T>(this);
    }

    protected __description(): string[] {
        return this.#variables.flatMap(v => v.description);
    }

    protected __process(value: string): Result<T> {
        const issues: string[] = [];

        for (const variable of this.#variables) {
            const result = variable.process(value);
            if (result.success)
                return result;
            else
                issues.push(...result.issues);
        }

        return Result.failure(issues);
    }
}