import { parseEnv } from "./env";

parseEnv(`
#This should error
asfasf = 'hello
` ,{})

console.log('DONE')