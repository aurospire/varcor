import { v } from "./variables";

const a = v.number().max(10).default(-100).optional();

console.log(a.toString())