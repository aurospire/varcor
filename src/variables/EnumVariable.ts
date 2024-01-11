import { Result } from "@/util";
import { Variable } from "./Variable";

export class EnumVariable<T extends string | never = never> extends Variable<T> {
    #items: string[];
    #insensitive: boolean;

    constructor(from?: EnumVariable<T>) {
        super(from);

        this.#items = (from ? [...from.#items] : []);
        this.#insensitive = (from ? from.#insensitive : false);
    }

    override get type(): string {
        return this.#items.map(i => `'${i}'`).join('/') || 'never';
    }

    insensitive(): Variable<T> {
        const newVar = this.__clone();
        newVar.#insensitive = true;
        return newVar;
    }

    sensitive(): Variable<T> {
        const newVar = this.__clone();
        newVar.#insensitive = false;
        return newVar;
    }

    value<S extends string>(value: S): EnumVariable<S | T> {
        const newVar = this.__clone();
        newVar.#items.push(value);
        return newVar;
    }

    protected override  __parse(value: string): Result<T> {
        let index: number;

        if (this.#insensitive)
            index = this.#items.map(i => i.toLocaleLowerCase()).indexOf(value.toLocaleLowerCase());
        else
            index = this.#items.indexOf(value);

        if (index !== -1)
            return Result.success(this.#items[index] as T);
        else
            return Result.failure(this.#items.length === 0 ? `must never exist` : `must be of ${this.type}`);
    }

    protected override  __clone(): EnumVariable<T> {
        return new EnumVariable(this);
    }

    protected override __object(): Record<string, any> {
        return { ...super.__object(), items: [...this.#items] };
    }
}