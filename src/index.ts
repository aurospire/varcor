import { DateObject } from "./util";
import { v } from "./variables";

const dr = DateObject.from({ year: 2017, month: 5, day: 15});

const d = dr.success ? DateObject.toISO(dr.value) : dr.issues;

console.log(d)