import { Infer, Result, v } from "./variables";

const a = v.number().max(10.23).defaultTo(-100.2).optional();
const b = v.integer().max(10).defaultTo(-100);
const c = v.string().validate(/[A-Z]/).optional();
const d = v.boolean().optional();
const e = v.enum().value('hello').value('goodbye');
const f = a.else(b).else(c).else(d).else(e);

console.log(a.toString());
console.log(b.toString());
console.log(c.toString());
console.log(d.toString());
console.log(e.toString());
console.log(f.toString());

console.log(d.parse());
