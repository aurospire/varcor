import { Variable } from "@/variables";

describe('Variable', () => {
    it('tests immutability', () => {
        const v0: Variable<number> = new Variable<number>();
        const v1 = v0.optional();
        const v2 = v1.defaultTo(10);

        expect(v0.isOptional).toBe(false);
        expect(v1.isOptional).toBe(true);
        expect(v2.isOptional).toBe(false);
        
        expect(v0.default).toBe(undefined);
        expect(v1.default).toBe(undefined);
        expect(v2.default).toBe(10);
    });

    it('tests .parse', () => {
        const v: Variable = new Variable();

        expect(v.parse().success).toBe(false);
        expect(v.parse('').success).toBe(false);
    });
});