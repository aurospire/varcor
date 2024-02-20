import { Variable } from "./Variable";

/**
 * Represents a type definition for an object where each property is a `Variable` with an unknown type. 
 */
export type VariableObject = { [key: string]: Variable<unknown>; };
