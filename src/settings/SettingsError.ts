export type SettingsIssues = {
    key: string;
    issues: string[];
};

export class SettingsError extends Error {
    #issues: SettingsIssues[];

    constructor(issues: SettingsIssues[], message?: string) {
        super(message);
        this.#issues = issues;
    }

    get errors() {
        return this.#issues;
    }
}
