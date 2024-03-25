import { Result, ResultFailure } from "@/util";
import { DataObjectBuilder, DataObject } from "@/data";
import { Variable, VariableObject } from "@/variables";
import { SettingsError, SettingsIssues } from "./SettingsError";

/**
 * Maps each key in a `VariableObject` to a `Result`. If the variable is of type `Variable<U>`, it maps to `Result<U, string[]>`.
 * This utility type is used to represent the outcome of parsing each setting within a settings object, where each setting's parse
 * result is either a success containing the parsed value or a failure containing error messages.
 *
 * @template T - A type extending `VariableObject`, representing a structured map of `Variable` instances.
 */
export type InferResults<T extends Variable<any> | VariableObject | Settings<any>> =
    T extends Variable<infer V> ? Result<V, string[]> :
    T extends Settings<infer V> ? InferValues<V> : {
        [K in keyof T]: T[K] extends Variable<any> | VariableObject | Settings<any> ? InferResults<T[K]> : never;
    };

/**
 * Similar to `SettingsResults`, but instead of mapping each key in a `VariableObject` to a `Result`, it maps each key
 * to the successfully parsed value or `never` if parsing was unsuccessful. This utility type focuses on the successful
 * parse outcomes, disregarding the errors, and is useful for obtaining a clean object with just the settings values,
 * assuming all parses were successful.
 *
 * @template T - A type extending `VariableObject`, representing a structured map of `Variable` instances.
 */
export type InferValues<T extends Variable<any> | VariableObject | Settings<any>> =
    T extends Variable<infer V> ? V :
    T extends Settings<infer V> ? InferValues<V> : {
        [K in keyof T]: T[K] extends Variable<any> | VariableObject | Settings<any> ? InferValues<T[K]> : never;
    };


const parseResults = (variables: VariableObject, data: DataObject, results: any = {}) => {
    for (const [key, node] of Object.entries(variables)) {
        if (node instanceof Variable) {
            const value = data[node.name ?? key];
            const result = node.parse(value);
            results[key] = result;
        }
        else {
            const subresults = (results[key] = {});

            parseResults(node, data, subresults);
        }
    }
};

/**
 * The `Settings` class is responsible for parsing a collection of settings based on a provided map of `Variable` instances.
 * Each `Variable` instance defines how a single setting should be parsed and validated. The class provides methods to
 * parse these settings from a `DataObject` or `DataObjectBuilder` and either return the raw parse results, including potential errors,
 * or the successfully parsed values, throwing an error if any parse fails.
 *
 * @template V - Specifies the structure of the settings to be parsed, where each property name is a setting key and its value is a `Variable` instance for parsing that setting.
 */
export class Settings<V extends VariableObject> {
    #variables: V;

    /**
     * Initializes a new instance of the `Settings` class with a specified map of `Variable` instances for parsing settings.
     *
     * @param variables - An object mapping setting names to `Variable` instances, defining how each setting should be parsed and validated.
     */
    constructor(variables: V) {
        this.#variables = variables;
    }

    /**
     * Parses settings from the provided data source, which can be either a `DataObject` directly or a `DataObjectBuilder` that
     * builds a `DataObject`. Each setting is parsed according to its corresponding `Variable` instance in the `#variables` map.
     * The method returns a `SettingsResults` object mapping each setting key to its parse result, which can be a success or failure.
     *
     * @param data - The data source containing the settings to be parsed, either as a `DataObject` or a `DataObjectBuilder`.
     * @returns A `SettingsResults` object containing the parse results for each setting.
     */
    parseResults(data: DataObject | DataObjectBuilder): InferResults<V> {
        if (data instanceof DataObjectBuilder)
            data = data.toDataObject();

        const results: any = {};

        parseResults(this.#variables, data, results);

        return results;
    }

    /**
     * Attempts to parse settings from the provided data source and return an object containing only the successfully parsed values.
     * If any setting fails to parse, this method throws a `SettingsError` containing details about the failed settings.
     *
     * @param data - The data source containing the settings to be parsed, either as a `DataObject` or a `DataObjectBuilder`.
     * @returns A `SettingsValues` object containing only the successfully parsed settings values.
     * @throws `SettingsError` containing the issues encountered during parsing if any setting fails to parse.
     */
    parseValues(data: DataObject | DataObjectBuilder): InferValues<V> {
        const results = this.parseResults(data);
        const errors = this.filterIssues(results);

        if (errors.length) {
            throw new SettingsError(errors, 'Settings had errors');
        }

        return Object.fromEntries(
            Object.entries(results).map(([key, result]) => [key, (result as any).value])
        ) as any;
    }

    /**
     * Filters through the parse results of each setting to identify and collect any issues encountered during parsing.
     * This method is useful for aggregating error information from the parsing process, especially before throwing a `SettingsError`.
     *
     * @param results - The `SettingsResults` object containing the parse results for each setting.
     * @returns An array of `SettingsIssues`, with each element containing the key of the setting and the associated error messages.
     */
    filterIssues(results: InferResults<V>): SettingsIssues[] {
        return Object.entries(results)
            .filter(([key, result]: [string, any]) => !result.success)
            .map(([key, result]: [string, any]) => ({
                key,
                issues: result.error,
            }));
    }
}
