import { inspect } from "util";
import { Result, Value } from "./Result";

export type Infer<V> = V extends Variable<infer T> ? T : never;

export type Transformer<I, O> = (value: I) => Result<O>;

export class Variable<T = never> {
    #optional: boolean;
    #default?: T;
    #description: string[];

    constructor(from?: Variable<T> | { optional: boolean, default?: T, description?: string[]; }) {

        this.#optional = from instanceof Variable ? from.#optional : (from?.optional ?? false);
        this.#default = from instanceof Variable ? from.#default : (from?.default ?? undefined);
        this.#description = from instanceof Variable ? from.#description : (from?.description ?? []);
    }

    parse(value?: string | undefined): Result<T> {
        if (value !== undefined)
            return this.__parse(value);
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


    protected __parse(value: string): Result<T> {
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

    else<S>(variable: Variable<S>): Variable<T | S> {
        return new AggregateVariable<T | S>(this, variable);
    }

    transform<S>(transform: Transformer<T, S>, type?: string): Variable<S> {
        return new TransformedVariable(undefined, { variable: this, function: transform, type });
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

        if (from instanceof AggregateVariable)
            this.#variables.push(...from.#variables);

        if (variable) {
            if (variable instanceof AggregateVariable)
                this.#variables.push(...variable.#variables);
            else
                this.#variables.push(variable);
        }
    }

    override get type(): string {
        return this.#variables.map(v => v.type).join('/');
    }

    protected __clone(): Variable<T> {
        return new AggregateVariable<T>(this);
    }

    protected __description(): string[] {
        return [...this.#variables.flatMap(v => v.description), ...super.__description()];
    }

    protected __parse(value: string): Result<T> {
        const issues: string[] = [];

        for (const variable of this.#variables) {
            const result = variable.parse(value);
            if (result.success)
                return result;
            else
                issues.push(...result.issues);
        }

        return Result.failure(issues);
    }
}

type TransformConfig<T> = { variable: Variable<any>, function: Transformer<any, T>, type?: string; };

class TransformedVariable<T> extends Variable<T> {
    #transform: TransformConfig<T>;

    constructor(from?: TransformedVariable<any>, transform?: TransformConfig<T>) {
        super(from);

        if (from) {
            this.#transform = transform ?? from.#transform;
        }
        else {
            if (!transform)
                this.#transform = { variable: new Variable(), function: () => Result.failure('No Transformer supplied') };
            else
                this.#transform = transform;
        }
    }

    override get type(): string {
        return `(${this.#transform.variable.type} -> ${this.#transform.type ?? '?'})`;
    }

    protected override __clone(): Variable<T> {
        return new TransformedVariable<T>(this);
    }

    protected override __parse(value: string): Result<T> {
        const result = this.#transform.variable.parse(value);

        return result.success ? this.#transform.function(result.value) : result;
    }

    protected __description(): string[] {
        return [...this.#transform.variable.description, ...super.__description()];
    }
}