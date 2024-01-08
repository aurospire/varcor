import { Result, Variable, v } from "@/variables";

describe('Variable', () => {
    it('tests immutability', () => {
        const v0: Variable<number> = new Variable<number>();
        const v1 = v0.optional();
        const v2 = v1.defaultTo(10);

        expect(v0.isOptional).toEqual(false);
        expect(v1.isOptional).toEqual(true);
        expect(v2.isOptional).toEqual(false);

        expect(v0.default).toEqual(undefined);
        expect(v1.default).toEqual(undefined);
        expect(v2.default).toEqual(10);
    });

    it('tests .required', () => {
        const v: Variable = new Variable();

        expect(v.parse().success).toEqual(false);
        expect(v.parse('').success).toEqual(false);
    });

    it('tests .optional', () => {
        const v = new Variable().optional();

        expect(v.parse()).toEqual(Result.success(undefined));
        expect(v.parse('').success).toEqual(false);
    });

    it('tests .default', () => {
        const v = new Variable<number>().defaultTo(10);

        expect(v.parse()).toEqual(Result.success(10));
        expect(v.parse('').success).toEqual(false);
    });
});

describe('BooleanVariable', () => {
    it('tests boolean', () => {
        const v0 = v.boolean();

        expect(v0.parse('t')).toEqual(Result.success(true));
        expect(v0.parse('true')).toEqual(Result.success(true));
        expect(v0.parse('1')).toEqual(Result.success(true));

        expect(v0.parse('f')).toEqual(Result.success(false));
        expect(v0.parse('false')).toEqual(Result.success(false));
        expect(v0.parse('0')).toEqual(Result.success(false));

        expect(v0.parse('2').success).toEqual(false);
    });
});

describe('NumberVariable', () => {
    it('tests Number', () => {
        const v1 = v.number();

        expect(v1.parse('1')).toEqual(Result.success(1));
        expect(v1.parse('1.23')).toEqual(Result.success(1.23));

        expect(v1.parse('asb').success).toEqual(false);
        expect(v1.parse('asb').success).toEqual(false);
    });

    it('tests min', () => {

    });
});