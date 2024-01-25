import { parseEnv } from "./env";

parseEnv(`
#This should error
asfasf = 'hello' asdfsa
` ,{})

console.log('DONE')