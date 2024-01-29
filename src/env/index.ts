import { Result } from "@/util";

export type EnvIssue = {

};

export const parseEnv = (env: string): Result<Record<string, string>, EnvIssue[]> => {
    return Result.failure([]);
};