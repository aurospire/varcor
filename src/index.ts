import { z } from 'zod';
import { v } from './helpers';
import { DateTime } from 'luxon';

export * from './variables';
export * from './settings';
export * from './helpers';
export * from './data';

const s = v.settings({
    a: v.boolean(),
    b: v.enum().value('A').value('B'),
    c: v.date(),
    d: v.tson(z.object({
        x: z.number(),
        y: z.array(z.string()),
    }))
});


console.log(DateTime.utc().toISO());

const d = v.data.json(JSON.stringify({
    a: true,
    b: 'A',
    c: DateTime.utc().toISO(),
    d: {
        x: 10,
        y: [1, 'X', 'Y', 'Z']
    }
}));

console.log(d.toDataObject());
const r = s.parseResults(d);

console.log(r)