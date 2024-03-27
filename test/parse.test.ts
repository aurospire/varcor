import { Result, v } from "@";

describe('parseResults', () => {
    const mapResultsToSuccess = (parsedObject: Record<string, any>): Record<string, boolean> => {
        return Object.fromEntries(
            Object.entries(parsedObject).map(([key, value]) => {
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

        expect(v.result(v0, data)).toEqual(Result.success(true));
        expect(v.result(v1, data).success).toBe(false);
        expect(v.result(v2, data)).toEqual(Result.success(undefined));
    });

    it('should test Simple Variable Objects', () => {
        const vars = {
            a: v.boolean(),
            b: v.enum().value('X').value('Y').from('B'),
            c: v.number().optional(),
            d: v.string().from('NAME')
        };

        const valid = v.data.obj({ a: true, B: 'X', NAME: 'hello' });
        const invalid = v.data.obj({ a: 10, B: false, c: null, NAME: undefined });
        const missing = v.data.obj({});

        expect(mapResultsToSuccess(v.result(vars, valid))).toEqual({ a: true, b: true, c: true, d: true });
        expect(mapResultsToSuccess(v.result(vars, invalid))).toEqual({ a: false, b: false, c: false, d: false });
        expect(mapResultsToSuccess(v.result(vars, missing))).toEqual({ a: false, b: false, c: true, d: false });
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

        const valid = v.data.obj({ a: true, C: 'hello', D: 10, g: 'X' });
        const invalid = v.data.obj({ a: 10, C: undefined, D: 'hello', g: 'Z' });
        const missing = v.data.obj({});

        expect(mapResultsToSuccess(v.result(vars, valid))).toEqual({ a: true, b: { c: true, d: true }, e: { f: { g: true } } });
        expect(mapResultsToSuccess(v.result(vars, invalid))).toEqual({ a: false, b: { c: false, d: false }, e: { f: { g: false } } });
        expect(mapResultsToSuccess(v.result(vars, missing))).toEqual({ a: false, b: { c: false, d: true }, e: { f: { g: false } } });
    });
});

describe('parseValues', () => {
    it('should test Variables', () => {
        const v0 = v.boolean().from('V0');
        const v1 = v.boolean().from('V1');
        const v2 = v.boolean().optional().from('V2');

        const data = { V0: 'true' };

        expect(v.value(v0, data)).toEqual(true);
        expect(() => v.value(v1, data)).toThrow();
        expect(v.value(v2, data)).toEqual(undefined);
    });

    it('should test Simple Variable Objects', () => {
        const vars = {
            a: v.boolean(),
            b: v.enum().value('X').value('Y').from('B'),
            c: v.number().optional(),
            d: v.string().from('NAME')
        };

        const valid = v.data.obj({ a: true, B: 'X', NAME: 'hello' });
        const invalid = v.data.obj({ a: 10, B: false, c: null, NAME: undefined });
        const missing = v.data.obj({});

        expect(v.value(vars, valid)).toEqual({ a: true, b: 'X', c: undefined, d: 'hello' });
        expect(() => v.value(vars, invalid)).toThrow();
        expect(() => v.value(vars, missing)).toThrow();
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

        const valid = v.data.obj({ a: true, C: 'hello', D: 10, g: 'X' });
        const invalid = v.data.obj({ a: 10, C: undefined, D: 'hello', g: 'Z' });
        const missing = v.data.obj({});

        expect(v.value(vars, valid)).toEqual({ a: true, b: { c: 'hello', d: 10 }, e: { f: { g: 'X' } } });
        expect(() => v.value(vars, invalid)).toThrow();
        expect(() => v.value(vars, missing)).toThrow();
    });
});