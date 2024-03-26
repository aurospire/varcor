import { Result } from "@/util";
import { Variable, VariableObject } from "@/variables";
import { DataObject, DataObjectBuilder } from "@/data";

/**
 * Represents the inferred results type of a collection of variables.
 * @template T The type of the variables or variable objects.
 */
export type InferResults<T extends Variable<unknown> | VariableObject> =
    T extends Variable<infer V> ? Result<V, string[]>
    : { [K in keyof T]: T[K] extends Variable<any> | VariableObject ? InferResults<T[K]> : never; };

/**
 * Recursively parses variables from a variable object and populates results.
 * @param {VariableObject} variables The variables or variable objects to parse.
 * @param {DataObject} data The data object containing variable values.
 * @param {any} results The results object to populate.
 * @private
 */
const _parseResults = (variables: VariableObject, data: DataObject, results: any = {}) => {
    for (const [key, node] of Object.entries(variables)) {
        if (node instanceof Variable) {
            const value = data[node.name ?? key];

            const result = node.parse(value);

            results[key] = result;
        }
        else {
            const subresults = (results[key] = {});

            _parseResults(node, data, subresults);
        }
    }
};

/**
 * Parses a collection of variables from a data object.
 * @param {VariableObject | Variable<unknown>} variables The variables or variable objects to parse.
 * @param {DataObject | DataObjectBuilder} data The data object or builder containing variable values.
 * @returns {InferResults<V>} The parsed results.
 */
export const parseResults = <V extends VariableObject | Variable<unknown>>(
    variables: V,
    data: DataObject | DataObjectBuilder = new DataObjectBuilder().addEnv()
): InferResults<V> => {
    if (data instanceof DataObjectBuilder) data = data.toDataObject();

    if (variables instanceof Variable) {
        if (!variables.name)
            throw new Error('Variable needs a name');

        return variables.parse(data[variables.name]) as InferResults<V>;
    }
    else {
        const results: any = {};

        _parseResults(variables, data, results);

        return results;
    }
};
