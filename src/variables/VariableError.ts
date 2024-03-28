import { VariableIssue } from "./VariableIssue";

/**
 * Custom error class extending the native `Error` class, designed to encapsulate and report issues encountered during
 * the parsing of settings. `SettingsError` provides structured access to these issues, allowing for detailed error handling
 * and reporting.
 */
export class VariableError extends Error {
    #issues: VariableIssue[];

    /**
     * Constructs a new `SettingsError` instance.
     * 
     * @param issues An array of `SettingsIssues` detailing the problems encountered during the parsing of settings. 
     * Each `SettingsIssues` object contains a `key` corresponding to a specific setting and an array of `issues` describing the parsing errors for that setting.
     * @param message An optional error message that provides a general description of the error. This message is accessible through the `message` property inherited from `Error`.
     */
    constructor(issues: VariableIssue[], message?: string) {
        super(message);
        this.#issues = issues;
        this.name = 'SettingsError'; // Set the error name to 'SettingsError' for easier identification.
    }

    /**
     * Retrieves the array of `SettingsIssues` associated with this error.
     * This getter allows for structured error handling, enabling callers to programmatically access and process the specific issues encountered during settings parsing.
     * 
     * @returns An array of `SettingsIssues`, each detailing a specific problem encountered during the parsing of a setting.
     */
    get errors() {
        return this.#issues;
    }
}
