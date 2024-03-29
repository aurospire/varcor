import { DateObject, InferValues, v } from '@';
import { expectType } from 'jestype';
import { DateTime } from 'luxon';

describe('InferValues', () => {
    it('tests Variables', () => {
        const v0 = v.string();
        const v1 = v.boolean();
        const v2 = v.number();
        const v3 = v.integer();
        const v4 = v.dateobj();
        const v5 = v.jsdate();
        const v6 = v.luxdate();
        const v7 = v.enum().value('A').value('B');
        const v8 = v.literal('A');

        expectType<InferValues<typeof v0>>().toBe<string>();
        expectType<InferValues<typeof v1>>().toBe<boolean>();
        expectType<InferValues<typeof v2>>().toBe<number>();
        expectType<InferValues<typeof v3>>().toBe<number>();
        expectType<InferValues<typeof v4>>().toBe<DateObject>();
        expectType<InferValues<typeof v5>>().toBe<Date>();
        expectType<InferValues<typeof v6>>().toBe<DateTime>();
        expectType<InferValues<typeof v7>>().toBe<'A' | 'B'>();
        expectType<InferValues<typeof v8>>().toBe<'A'>();
    });
});