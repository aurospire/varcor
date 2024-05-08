import { InferResults, InferValues, Result, v } from "@";

describe('parseResults', () => {
    const mapResultsToSuccess = (parsedObject: Record<string | number, any>) => {
        return (parsedObject instanceof Array) ?
            parsedObject.map((item): any => mapResultsToSuccess(item)) : Object.fromEntries(
                Object.entries(parsedObject).map(([key, value]): any => {
                    if ('success' in value)
                        return [key, value.success];
                    else
                        return [key, mapResultsToSuccess(value)];
                })
            );
    };

    it('should test Variables', () => {
        const v0 = v.boolean().from('V0');
        const v1 = v.boolean().from('V1');
        const v2 = v.boolean().optional().from('V2');

        const data = { V0: 'true' };

        expect(v.results(v0, data)).toEqual(Result.success(true));
        expect(v.results(v1, data).success).toBe(false);
        expect(v.results(v2, data)).toEqual(Result.success(undefined));
    });

    it('should test Simple Variable Objects', () => {
        const vars = {
            a: v.boolean(),
            b: v.enum().value('X').value('Y').from('B'),
            c: v.number().optional(),
            d: v.string().from('NAME')
        };

        const valid = v.data.object({ a: true, B: 'X', NAME: 'hello' });
        const invalid = v.data.object({ a: 10, B: false, c: null, NAME: undefined });
        const missing = v.data.object({});

        expect(mapResultsToSuccess(v.results(vars, valid))).toEqual({ a: true, b: true, c: true, d: true });
        expect(mapResultsToSuccess(v.results(vars, invalid))).toEqual({ a: false, b: false, c: false, d: false });
        expect(mapResultsToSuccess(v.results(vars, missing))).toEqual({ a: false, b: false, c: true, d: false });
    });

    it('should test Nested Variable Object', () => {
        const vars = {
            a: v.boolean(),
            b: {
                c: v.string().from('C'),
                d: v.number().from('D').optional()
            },
            e: {
                f: {
                    g: v.enum().value('X').value('Y')
                }
            }
        };

        const valid = v.data.object({ a: true, C: 'hello', D: 10, g: 'X' });
        const invalid = v.data.object({ a: 10, C: undefined, D: 'hello', g: 'Z' });
        const missing = v.data.object({});

        expect(mapResultsToSuccess(v.results(vars, valid))).toEqual({ a: true, b: { c: true, d: true }, e: { f: { g: true } } });
        expect(mapResultsToSuccess(v.results(vars, invalid))).toEqual({ a: false, b: { c: false, d: false }, e: { f: { g: false } } });
        expect(mapResultsToSuccess(v.results(vars, missing))).toEqual({ a: false, b: { c: false, d: true }, e: { f: { g: false } } });
    });

    it('should test Union Variable Object', () => {
        const vars = {
            a: [{ b: v.boolean(), c: v.integer() }, { d: v.string() }] as const
        };

        const first = v.data.object({ b: true, c: 10 });
        const second = v.data.object({ d: 'hello' });
        const both = first.data(second);

        expect(mapResultsToSuccess(v.results(vars, first))).toEqual({ a: [{ b: true, c: true }, { d: false }] });
        expect(mapResultsToSuccess(v.results(vars, second))).toEqual({ a: [{ b: false, c: false }, { d: true }] });
        expect(mapResultsToSuccess(v.results(vars, both))).toEqual({ a: [{ b: true, c: true }, { d: true }] });
    });
});

describe('parseValues', () => {
    it('should test Variables', () => {
        const v0 = v.boolean().from('V0');
        const v1 = v.boolean().from('V1');
        const v2 = v.boolean().optional().from('V2');

        const data = { V0: 'true' };

        expect(v.values(v0, data)).toEqual(true);
        expect(() => v.values(v1, data)).toThrow();
        expect(v.values(v2, data)).toEqual(undefined);
    });

    it('should test Simple Variable Objects', () => {
        const vars = {
            a: v.boolean(),
            b: v.enum().value('X').value('Y').from('B'),
            c: v.number().optional(),
            d: v.string().from('NAME')
        };

        const valid = v.data.object({ a: true, B: 'X', NAME: 'hello' });
        const invalid = v.data.object({ a: 10, B: false, c: null, NAME: undefined });
        const missing = v.data.object({});

        expect(v.values(vars, valid)).toEqual({ a: true, b: 'X', c: undefined, d: 'hello' });
        expect(() => v.values(vars, invalid)).toThrow();
        expect(() => v.values(vars, missing)).toThrow();
    });

    it('should test Nested Variable Object', () => {
        const vars = {
            a: v.boolean(),
            b: {
                c: v.string().from('C'),
                d: v.number().from('D').optional()
            },
            e: {
                f: {
                    g: v.enum().value('X').value('Y')
                }
            }
        };

        const valid = v.data.object({ a: true, C: 'hello', D: 10, g: 'X' });
        const invalid = v.data.object({ a: 10, C: undefined, D: 'hello', g: 'Z' });
        const missing = v.data.object({});

        expect(v.values(vars, valid)).toEqual({ a: true, b: { c: 'hello', d: 10 }, e: { f: { g: 'X' } } });
        expect(() => v.values(vars, invalid)).toThrow();
        expect(() => v.values(vars, missing)).toThrow();
    });

    it('should test Union Variable Object', () => {
        const vars = {
            a: [{ b: v.boolean(), c: v.integer() }, { d: v.string() }] as const
        };

        const first = v.data.object({ b: true, c: 10 });
        const second = v.data.object({ d: 'hello' });
        const both = first.data(second);

        expect((v.values(vars, first))).toEqual({ a: { b: true, c: 10 } });
        expect((v.values(vars, second))).toEqual({ a: { d: 'hello' } });
        expect((v.values(vars, both))).toEqual({ a: { b: true, c: 10 } });
    });
});
