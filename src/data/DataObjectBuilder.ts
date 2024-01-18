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

    addJson(json: string): DataObjectBuilder {
        return this.addObject(JSON.parse(json));
    }

    toDataObject(): DataObject {
        return { ...this.#data };
    }
}