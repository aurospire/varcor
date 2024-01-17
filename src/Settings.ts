import { Variable, v } from "./variables";

export type VariableObject = { [key: string]: Variable<unknown>; };

export type DataObject = { [key: string]: string | undefined; };

export type Settings<T extends VariableObject> = {
    [K in keyof T]: T[K] extends Variable<infer U> ? U : never;
};

const makeSettings = <V extends VariableObject>(variables: V) => (data: DataObject): Settings<V> => {
    const result = {};    

    for (const [key, variable] of Object.entries(variables)) {
        const value = data[key];

        const result = variable.parse(value);
    }
};