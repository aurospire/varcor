import { Result } from "@/util";

/**
 * Represents an issue encountered while parsing an environment variable definition.
 * It provides details about the location and nature of the parsing issue.
 */
export type EnvIssue = {
    /**
     * The line number in the input string where the issue was encountered.
     */
    line: number;
    /**
     * The column number in the input string where the issue starts.
     * This implementation sets column to 0 as it does not calculate the exact column.
     */
    column: number;
    /**
     * The value of the line in the input string that caused the issue.
     */
    value: string;
    /**
     * A message describing the issue encountered during parsing.
     */
    message: string;
};

// Regular expressions used for parsing the .env file format.
const ignoreableRegex = /^\s*(?:#.*)?$/;
const singleQuoted = `(?:'(?<contentS>[^']*)')`;
const doubleQuoted = `(?:"(?<contentD>(?:[^"$]|\\$\\$)*)")`;
const unquoted = `(?:(?<contentU>[^'"\\s;]*))`;
const valueRegex = `^(${singleQuoted}|${doubleQuoted}|${unquoted})(?<rest>.*)$`;
const varRegex = new RegExp(`^\\s*((?:export)\\s+)?(?<key>[A-Za-z_][A-Za-z0-9_]*)=(?<value>(?:${singleQuoted}|${doubleQuoted}|${unquoted})*)\\s*;?\\s*(?:#.*)?$`);

/**
 * Parses a string containing environment variable definitions into a record of variable names and values.
 * Comments and export prefixes are ignored. Variables can be single-quoted, double-quoted, or unquoted.
 * Issues with parsing individual lines are collected and reported.
 * 
 * @param data - The string containing the environment variable definitions to be parsed.
 * @returns A `Result` object that contains either a record of parsed environment variables (on success)
 *          or an array of `EnvIssue` detailing parsing errors (on failure).
 */
export const parseEnv = (data: string): Result<Record<string, string>, EnvIssue[]> => {
    const lines = data.split(/(?:\r\n?)|\n/g);
    const issues: EnvIssue[] = [];
    const vars: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Skip empty lines or lines that only contain comments.
        if (line.match(ignoreableRegex))
            continue;

        // Attempt to parse the key and value using the regular expression.
        let { key, value } = line.match(varRegex)?.groups ?? {};

        if (key) {
            let result = '';

            // Process the value, supporting single-quoted, double-quoted, and unquoted values.
            while (value) {
                const { contentS, contentD, contentU, rest } = value.match(valueRegex)?.groups ?? {};
                const piece = contentS ?? contentD ?? contentU;
                result += piece;
                value = rest;
            }

            vars[key] = result;
        } else {
            issues.push({
                line: i + 1,
                column: 1,
                value: line,
                message: 'Invalid Line'
            });
        }
    }

    return issues.length ? Result.failure(issues) : Result.success(vars);
};
