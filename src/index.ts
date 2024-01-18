import { v } from './helpers';

export * from './variables';
export * from './settings';
export * from './helpers';


const s = v.settings({
    a: v.number().max(10)
});

const results = s.parseValues({
    a: "15"
});