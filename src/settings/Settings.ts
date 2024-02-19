import { Result } from "@/util";
import { DataObjectBuilder, DataObject } from "@/data";
import { Variable, VariableObject } from "@/variables";
import { SettingsError, SettingsIssues } from "./SettingsError";

export type SettingsResults<T extends VariableObject> = {
    [K in keyof T]: T[K] extends Variable<infer U> ? Result<U, string[]> : never;
};

export type SettingsValues<T extends VariableObject> = {
    [K in keyof T]: T[K] extends Variable<infer U> ? U : never;
};

export class Settings<V extends VariableObject> {
    #variables: V;

    constructor(variables: V) {
        this.#variables = variables;
    }

    parseResults(data: DataObject | DataObjectBuilder): SettingsResults<V> {
        if (data instanceof DataObjectBuilder)
            data = data.toDataObject();

        const results: any = {};

        for (const [key, variable] of Object.entries(this.#variables)) {
            const value = data[key];

            const result = variable.parse(value);

            results[key] = result;
        }

        return results;
    }

    parseValues(data: DataObject | DataObjectBuilder): SettingsValues<V> {
        const results = this.parseResults(data);

        const errors = this.filterIssues(results);

        if (errors.length)
            throw new SettingsError(errors, 'Settings had errors');

        return Object.fromEntries(
            Object
                .entries(results)
                .map(([key, result]) => [key, result.value])
        ) as any;
    }

    filterIssues(results: SettingsResults<V>): SettingsIssues[] {
        return Object
            .entries(results)
            .filter(([key, result]) => !result.success)
            .map(([key, result]) => ({ key, issues: result.errors }));
    }
}
