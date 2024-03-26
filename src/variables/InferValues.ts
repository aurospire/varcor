import { DataObject, DataObjectBuilder } from "@/data";
import { Variable, VariableObject } from "@/variables";
import { VariableIssue } from "./VariableIssue";
import { VariableError } from "./VariableError";

/**
 * Similar to `InferResults`, but instead of mapping each key in a `VariableObject` to a `Result`, it maps each key
 * to the successfully parsed value or `never` if parsing was unsuccessful. This utility type focuses on the successful
 * parse outcomes, disregarding the errors, and is useful for obtaining a clean object with just the settings values,
 * assuming all parses were successful.
 *
 * @template T - A type extending `VariableObject`, representing a structured map of `Variable` instances.
 */
export type InferValues<T extends Variable<any> | VariableObject> =
    T extends Variable<infer V> ? V
    : { [K in keyof T]: T[K] extends Variable<any> | VariableObject ? InferValues<T[K]> : never; };

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
    for (const [key, node] of Object.entries(vars)) {
        if (node instanceof Variable) {
            const value = data[node.name ?? key];

            const result = node.parse(value);

            if (result.success) {
                results[key] = result.value;
            }
            else {
                issues.push({ key: [...parent, key], issues: result.error });
            }
        }
        else {
            const subresults = (results[key] = {});

            _parseValues(node, data, subresults, [...parent, key], issues);
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

        return vars.parse(data[vars.name]) as InferValues<V>;
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
