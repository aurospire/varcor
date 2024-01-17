import { DateObject, date, datetime, datetimeTz, time, timeTz, Result } from "@/util";
import { Variable } from "./Variable";


export class DateObjectVariable extends Variable<DateObject> {
    #formats: RegExp[];

    constructor(from?: DateObjectVariable, ...formats: RegExp[]) {
        super(from);

        this.#formats = formats.length ? formats : (from ? [...from.#formats] : [DateObject.regex.datetimeTz]);
    }

    format(regex: RegExp | RegExp[], clear: boolean = false): DateObjectVariable {
        if (regex instanceof RegExp) regex = [regex];

        const newVar = this.__clone();
        newVar.#formats = clear ? [...regex] : [...this.#formats, ...regex];
        return newVar;
    }

    override get type(): string {
        return 'Date';
    }

    protected override  __parse(value: string): Result<DateObject> {
        for (const format of this.#formats) {
            const result = DateObject.parse(value, format);

            if (result.success)
                return result;
        }

        return Result.failure(`must be in a valid date format.`);
    }

    protected override  __clone(): DateObjectVariable {
        return new DateObjectVariable(this);
    }

    protected __object(): Record<string, any> {
        return { ...super.__object(), formats: [...this.#formats] };
    }
}