import { Variable } from "../variables";


export type VariableObject = { [key: string]: Variable<unknown>; };

export type DataObject = { [key: string]: string | undefined; };
