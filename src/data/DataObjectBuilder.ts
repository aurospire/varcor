import nodefs from 'fs';
import { parseEnv } from "@/env";
import { DataObject } from "./DataObject";

export class DataObjectBuilder {
    #data: DataObject;

    constructor(...objects: DataObject[]) {
        let data = {};

        for (const object of objects)
            data = { ...data, ...object };

        this.#data = data;
    }

    addDataObject(data: DataObject): DataObjectBuilder {
        return new DataObjectBuilder(this.#data, data);
    }

    addEnv(): DataObjectBuilder {
        return this.addDataObject(process.env);
    }

    addObject(object: Record<string, any>): DataObjectBuilder {
        const data = Object.fromEntries(Object.entries(object).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));

        return this.addDataObject(data);
    }

    addEnvFormat(env: string): DataObjectBuilder {
        const result = parseEnv(env);

        if (result.success)
            return this.addObject(result.value);
        else
            throw new Error(JSON.stringify(result.error));
    }

    addJsonFormat(json: string): DataObjectBuilder {
        return this.addObject(JSON.parse(json));
    }

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

    toDataObject(): DataObject {
        return { ...this.#data };
    }
}