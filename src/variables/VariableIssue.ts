/**
 * Defines the structure for reporting issues encountered during the parsing of settings.
 * Each `SettingsIssues` instance represents a specific issue related to a setting identified by `key`,
 * accompanied by an array of `issues` that detail the problems encountered during parsing.
 */
export type VariableIssue = {
    /**
     * The key of the setting for which issues were encountered - strings for keys, numbers for indexes of union
     */
    key: Array<string | number>;

    /**
     * An array of strings, each describing a specific issue encountered with the setting identified by `key`.
     */
    issues: string[];
};
