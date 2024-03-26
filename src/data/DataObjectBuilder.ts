import nodefs from 'fs';
import { parseDotEnv } from "@/dotenv";
import { DataObject } from './DataObject';
/**
 * Type definition for file-related options used in file processing methods.
 */
export type FileOptions = {
    /**
     * Conditionally perform the file operation based on this boolean value.
     */
    when?: boolean;

    /**
     * Whether the file is required to exist, throwing an error if not found.
     */
    optional?: boolean;

    /**
     * A custom function to check if the file exists. Defaults to Node.js `fs.existsSync`.
     * @param path The file path to check.
     * @returns `true` if the file exists, `false` otherwise.
     */
    fileExists?: (path: string) => boolean;

    /**
     * A custom function to read the file content. Defaults to Node.js `fs.readFileSync`.
     * @param path The file path to read.
     * @returns The file content as a string.
     */
    readFile?: (path: string) => string;
};

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
        const data = Object.fromEntries(
            Object.entries(object).map(([key, value]) => [
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            ])
        );

        return this.addDataObject(data);
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
     * Parses a `.env` format string and adds the resulting environment variables to the data object.
     * @param env A string in `.env` file format.
     * @throws An error if parsing fails.
     * @returns A new instance of `DataObjectBuilder` including the parsed environment variables for chaining.
     */
    addDotEnvFormat(env: string): DataObjectBuilder {
        const result = parseDotEnv(env);

        if (result.success) {
            return this.addDataObject(result.value);
        }
        else
            throw new Error(JSON.stringify(result.error));
    }

    /**
     * Internal method to add file content to the builder after applying the specified processing based on the file type.
     * This method centralizes the file reading logic and delegates the processing to the appropriate method based on the file type.
     * 
     * @param fileType The type of the file to dictate the processing method. Supported types are 'json' and 'dotenv'.
     * @param path The file path to read. This is the location of the file to be processed and added to the data object.
     * @param options Optional parameters to control the file processing behavior. This includes custom checks for file existence,
     * custom file reading logic, and conditions on whether the file processing should occur.
     * 
     * @returns A new instance of `DataObjectBuilder` including the data from the processed file for chaining. If the file is not 
     * required and doesn't exist, or the `when` condition is false, it returns the current instance without modification.
     * 
     * @throws Error if the file is required but does not exist, or if there is an error in processing the file content.
     */
    #addFile(fileType: 'json' | 'dotenv', path: string, options?: FileOptions,): DataObjectBuilder {
        const when = options?.when ?? true;
        const optional = options?.optional ?? true;
        const exists = options?.fileExists ?? nodefs.existsSync;
        const readFile = options?.readFile ?? nodefs.readFileSync;

        if (when) {
            if (exists(path)) {
                const data = readFile(path).toString();

                if (fileType === 'json')
                    return this.addJsonFormat(data);
                else
                    return this.addDotEnvFormat(data);
            }
            else if (!optional)
                throw new Error(`Missing File ${path}`);
        }

        return this;
    }

    /**
     * Adds the content of a JSON file to the data object.
     * @param path The file path to read.
     * @param options Options to control file reading behavior.
     * @returns A new instance of `DataObjectBuilder` including the parsed JSON file content for chaining.
     */
    addJsonFile(path: string, options?: FileOptions): DataObjectBuilder {
        return this.#addFile('json', path, options);
    }

    /**
     * Adds the content of a `.env` file to the data object.
     * @param path The file path to read.
     * @param options Options to control file reading behavior.
     * @returns A new instance of `DataObjectBuilder` including the parsed `.env` file content for chaining.
     */
    addDotEnvFile(path: string, options?: FileOptions): DataObjectBuilder {
        return this.#addFile('dotenv', path, options);
    }


    /**
     * Finalizes the building process and returns the constructed `DataObject`.
     * @returns The constructed `DataObject` containing all added data.
     */
    toDataObject(): DataObject {
        return { ...this.#data };
    }

    static env() {
        return new DataObjectBuilder().addEnv();
    }
}
