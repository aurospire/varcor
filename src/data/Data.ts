import { DataObject } from "./DataObject";

export class Data {
    #data: DataObject;

    constructor(...objects: DataObject[]) {
        let data = {};

        for (const object of objects)
            data = { ...data, ...object };

        this.#data = data;
    }

    importDataObject(data: DataObject): Data {
        return new Data(this.#data, data);
    }

    importEnv(): Data {
        return this.importDataObject(process.env);
    }

    importObject(object: Record<string, any>): Data {
        const data = Object.fromEntries(Object.entries(object).map(([key, value]) => [key, JSON.stringify(value)]));

        return this.importDataObject(data);
    }

    export(): DataObject {
        return { ...this.#data };
    }
}