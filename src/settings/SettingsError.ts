/**
 * Defines the structure for reporting issues encountered during the parsing of settings.
 * Each `SettingsIssues` instance represents a specific issue related to a setting identified by `key`,
 * accompanied by an array of `issues` that detail the problems encountered during parsing.
 */
export type SettingsIssues = {
    /**
     * The key of the setting for which issues were encountered.
     */
    key: string;

    /**
     * An array of strings, each describing a specific issue encountered with the setting identified by `key`.
     */
    issues: string[];
};

/**
 * Custom error class extending the native `Error` class, designed to encapsulate and report issues encountered during
 * the parsing of settings. `SettingsError` provides structured access to these issues, allowing for detailed error handling
 * and reporting.
 */
export class SettingsError extends Error {
    #issues: SettingsIssues[];

    /**
     * Constructs a new `SettingsError` instance.
     * 
     * @param issues An array of `SettingsIssues` detailing the problems encountered during the parsing of settings. 
     * Each `SettingsIssues` object contains a `key` corresponding to a specific setting and an array of `issues` describing the parsing errors for that setting.
     * @param message An optional error message that provides a general description of the error. This message is accessible through the `message` property inherited from `Error`.
     */
    constructor(issues: SettingsIssues[], message?: string) {
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
