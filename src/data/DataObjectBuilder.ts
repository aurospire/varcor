import nodefs from 'fs';
import { parseEnv } from "@/env";
import { DataObject } from './DataObject';

/**
 * A builder class for constructing a `DataObject` from various data sources like environment variables,
 * JSON strings, `.env` format strings, and files. It provides a fluent API to easily chain calls to build
 * up the final data object.
 */
export class DataObjectBuilder {
    #data: DataObject;

    /**
     * Initializes a new instance of `DataObjectBuilder` with optional initial data objects.
     * @param objects One or more `DataObject` instances to start the building process.
     */
    constructor(...objects: DataObject[]) {
        let data = {};

        for (const object of objects)
            data = { ...data, ...object };

        this.#data = data;
    }

    /**
     * Adds a data object to the current data being built.
     * @param data A `DataObject` to add to the builder.
     * @returns A new instance of `DataObjectBuilder` including the added data for chaining.
     */
    addDataObject(data: DataObject): DataObjectBuilder {
        return new DataObjectBuilder(this.#data, data);
    }

    /**
     * Adds the current environment variables to the data object.
     * @returns A new instance of `DataObjectBuilder` including the environment variables for chaining.
     */
    addEnv(): DataObjectBuilder {
        return this.addDataObject(process.env);
    }

    /**
     * Adds an arbitrary object to the data object. Non-string values are JSON-stringified.
     * @param object A record object with key-value pairs to add. Values are stringified if not strings.
     * @returns A new instance of `DataObjectBuilder` including the added object for chaining.
     */
    addObject(object: Record<string, any>): DataObjectBuilder {
        const data = Object.fromEntries(Object.entries(object).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));

        return this.addDataObject(data);
    }

    /**
     * Parses a `.env` format string and adds the resulting environment variables to the data object.
     * @param env A string in `.env` file format.
     * @throws An error if parsing fails.
     * @returns A new instance of `DataObjectBuilder` including the parsed environment variables for chaining.
     */
    addEnvFormat(env: string): DataObjectBuilder {
        const result = parseEnv(env);

        if (result.success)
            return this.addObject(result.value);
        else
            throw new Error(JSON.stringify(result.error));
    }

    /**
     * Parses a JSON string and adds the resulting object to the data object.
     * @param json A JSON-formatted string.
     * @returns A new instance of `DataObjectBuilder` including the parsed JSON object for chaining.
     */
    addJsonFormat(json: string): DataObjectBuilder {
        return this.addObject(JSON.parse(json));
    }

    /**
     * Reads and parses an environment variable file in `.env` format and adds the variables to the data object.
     * @param path The file path to the `.env` file.
     * @param mustExist If true, throws an error if the file does not exist.
     * @param condition If false, skips adding the file content.
     * @throws An error if the file is missing and mustExist is true.
     * @returns A new instance of `DataObjectBuilder` for chaining.
     */
    addEnvFile(path: string, mustExist: boolean = true, condition: boolean = true): DataObjectBuilder {
        if (condition) {
            if (nodefs.existsSync(path)) {
                const data = nodefs.readFileSync(path).toString();
                return this.addEnvFormat(data);
            }
            else if (mustExist) {
                throw new Error(`Missing File ${path}`);
            }
        }
        return this;
    }

    /**
     * Reads and parses a JSON file and adds the resulting object to the data object.
     * @param path The file path to the JSON file.
     * @param mustExist If true, throws an error if the file does not exist.
     * @param condition If false, skips adding the file content.
     * @throws An error if the file is missing and mustExist is true.
     * @returns A new instance of `DataObjectBuilder` for chaining.
     */
    addJsonFile(path: string, mustExist: boolean = true, condition: boolean = true): DataObjectBuilder {
        if (condition) {
            if (nodefs.existsSync(path)) {
                const data = nodefs.readFileSync(path).toString();
                return this.addJsonFormat(data);
            }
            else if (mustExist) {
                throw new Error(`Missing File ${path}`);
            }
        }
        return this;
    }

    /**
     * Finalizes the building process and returns the constructed `DataObject`.
     * @returns The constructed `DataObject` containing all added data.
     */
    toDataObject(): DataObject {
        return { ...this.#data };
    }
}
