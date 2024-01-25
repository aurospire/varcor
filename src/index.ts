import { parseEnv } from "./env";

parseEnv(`
#This should error
asfasf
` ,{})

console.log('DONE')