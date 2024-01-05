import { Variable } from './Variable';


export type InferVariable<V> = V extends Variable<infer T> ? T : never;

export type InferObject<O extends Record<string, any>> = {
    [K in keyof O]: InferVariable<O[K]>;
};
