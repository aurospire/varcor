import { DataObject, DataObjectBuilder } from "@/data";
import { Variable, VariableObject } from "@/variables";
import { VariableIssue } from "./VariableIssue";
import { VariableError } from "./VariableError";

/**
 * Represents the inferred values type of a collection of variables or variable objects,
 * including nested structures and arrays.
 * @template T - A type extending `Variable<any>`, `VariableObject`, or `readonly VariableObject[]`.
 */
export type InferValues<T extends Variable<any> | VariableObject | readonly VariableObject[]> =
    T extends Variable<infer V> ? V :
    T extends readonly VariableObject[] ? InferValues<T[number]> :
    T extends VariableObject ? { -readonly [K in keyof T]: T[K] extends Variable<any> | VariableObject | readonly VariableObject[] ? InferValues<T[K]> : never; } :
    never;

/**
 * Recursively parses variables from a variable object and populates results with successfully parsed values.
 * @param {VariableObject} vars The variables or variable objects to parse.
 * @param {DataObject} data The data object containing variable values.
 * @param {any} results The results object to populate with successfully parsed values.
 * @param {string[]} parent The parent keys in the object hierarchy.
 * @param {VariableIssue[]} issues The array to populate with parsing issues.
 * @private
 */
const _parseValues = (vars: VariableObject, data: DataObject, results: any = {}, parent: string[] = [], issues: VariableIssue[] = []) => {
    for (const [key, subvars] of Object.entries(vars)) {
        if (subvars instanceof Variable) {
            const value = data[subvars.name ?? key];

            const result = subvars.parse(value);

            if (result.success) {
                results[key] = result.value;
            }
            else {
                issues.push({ key: [...parent, key], issues: result.error });
            }
        }
        else if (subvars instanceof Array) {
            let arrayissues: VariableIssue[] = [];

            for (let i = 0; i < subvars.length; i++) {
                const subvaritem = subvars[i];
                const subresults: any = {};
                const subissues: VariableIssue[] = [];

                _parseValues(subvaritem, data, subresults, [...parent, key, i.toString()], subissues);

                if (subissues.length) {
                    arrayissues.push(...subissues);
                }
                else {
                    results[key] = subresults;
                    arrayissues = [];
                    break;
                }
            }

            if (arrayissues.length)
                issues.push(...arrayissues);
        }
        else {
            const subresults = (results[key] = {});

            _parseValues(subvars, data, subresults, [...parent, key], issues);
        }
    }
};

/**
 * Parses a collection of variables from a data object and returns successfully parsed values.
 * Throws a VariableError if parsing encounters issues.
 * @param {VariableObject | Variable<unknown>} vars The variables or variable objects to parse.
 * @param {DataObject | DataObjectBuilder} data The data object or builder containing variable values.
 * @returns {InferValues<V>} The successfully parsed values.
 * @throws {VariableError} If parsing encounters issues.
 */
export const parseValues = <V extends VariableObject | Variable<unknown>>(
    vars: V,
    data: DataObject | DataObjectBuilder = DataObjectBuilder.env()
): InferValues<V> => {
    if (data instanceof DataObjectBuilder) data = data.toDataObject();

    if (vars instanceof Variable) {
        if (!vars.name)
            throw new Error('Variable needs a name');

        const result = vars.parse(data[vars.name]);

        if (result.success)
            return result.value as InferValues<V>;
        else
            throw new VariableError([{ key: [vars.name], issues: result.error }]);
    }
    else {
        const results: any = {};
        const issues: VariableIssue[] = [];

        _parseValues(vars, data, results, [], issues);

        if (issues.length === 0)
            return results;
        else
            throw new VariableError(issues);
    }
};
