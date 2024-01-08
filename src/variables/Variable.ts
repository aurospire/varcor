import { inspect } from "util";
import { Result, Value } from "./Result";

export type Transformer<I, O> = (value: I) => Result<O>;

export class Variable<T = never> {
    #optional: boolean;
    #default?: T;

    constructor(from?: Variable<T> | { optional: boolean, default?: T }) {
        this.#optional = from instanceof Variable ? from.#optional : (from?.optional ?? false);
        this.#default = from instanceof Variable ? from.#default : (from?.default ?? undefined);
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

    get type(): string {
        return 'never';
    }


    protected __parse(value: string): Result<T> {
        return Result.failure('must never exist');
    }

    protected __clone(): Variable<T> {
        return new Variable<T>(this);
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

    else<S>(variable: Variable<S>): Variable<T | S> {
        return new AggregateVariable<T | S>(this, variable);
    }

    transform<S>(transform: Transformer<T, S>, type?: string): Variable<S> {
        return new TransformedVariable<S>(undefined, { from: this, transform, type });
    }

    protected __object(): Record<string, any> {
        return {
            type: this.type,
            optional: this.isOptional,
            default: this.default,
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

type TransformData<I, O> = { from: Variable<I>, transform: Transformer<I, O>, type?: string; };

class TransformedVariable<T> extends Variable<T> {
    #data: TransformData<any, any>;

    constructor(from?: TransformedVariable<T>, data?: TransformData<any, any>) {
        super(from);

        if (data)
            this.#data = data;
        else if (from)
            this.#data = from.#data;
        else
            this.#data = { from: new Variable<any>(), transform: () => { throw new Error('Invalid transform'); } };
    }

    override get type(): string {
        return `{${this.#data.from.type}->${this.#data.type ?? '?'}}`;
    }

    override parse(value?: string | undefined): Result<T> {
        if (value === undefined && (this.isOptional || this.default !== undefined)) {
            return super.parse(value);
        }

        const result = this.#data.from.parse(value);

        return this.#data.transform(result);
    }

    protected __object(): Record<string, any> {
        return { ...super.__object, from: this.#data.from, type: this.#data.type };
    }
}