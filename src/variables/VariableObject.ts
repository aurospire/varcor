import { Variable } from "./Variable";

/**
 * Represents an object where each key-value pair corresponds to a variable or a nested structure of variables.
 * Variables in this object can be of type `Variable<unknown>`, nested `VariableObject`, readonly nested `VariableObject`,
 * or readonly array of nested `VariableObject` (representing a choice union).
 */
export type VariableObject = { [key: string]: Variable<unknown> | VariableObject | Readonly<VariableObject> | ReadonlyArray<VariableObject>; };
