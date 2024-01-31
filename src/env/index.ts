import { Result } from "@/util";

export type EnvIssue = {
    line: number;
    column: number;
    value: string;
    message: string,
};

const ignoreableRegex = /^\s*(?:#.*)?$/;

const singleQuoted = `(?:'(?<contentS>[^']*)')`;
const doubleQuoted = `(?:"(?<contentD>(?:[^"$]|\\$\\$)*)")`;
const unquoted = `(?:(?<contentU>[^'"\\s;]*))`;

const valueRegex = `^(${singleQuoted}|${doubleQuoted}|${unquoted})(?<rest>.*)$`;

const varRegex = new RegExp(`^\\s*((?:export)\\s+)?(?<key>[A-Za-z_][A-Za-z0-9_]*)=(?<value>(?:${singleQuoted}|${doubleQuoted}|${unquoted})*)\\s*;?\\s*(?:#.*)?$`);

export const parseEnv = (data: string): Result<Record<string, string>, EnvIssue[]> => {
    const lines = data.split(/(?:\r\n?)|\n/g);

    const issues: EnvIssue[] = [];

    const vars: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.match(ignoreableRegex))
            continue;

        let { key, value } = line.match(varRegex)?.groups ?? {};

        if (key) {
            let result = '';

            while (value) {
                const { contentS, contentD, contentU, rest } = value.match(valueRegex)?.groups ?? {};

                const piece = contentS ?? contentD ?? contentU;

                result += piece;

                value = rest;
            }

            vars[key] = result;
        }
        else {
            issues.push({
                line: i,
                column: 0,
                value: line,
                message: 'Invalid Line'
            });
        }
    }

    return issues.length ? Result.failure(issues) : Result.success(vars);
};