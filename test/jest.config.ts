import { Config } from '@jest/types';

import nodefs from 'fs';
import nodepath from 'path';

import { jestAliases } from 'ts-unalias';

const packagejson = JSON.parse(nodefs.readFileSync('package.json').toString());

const modules = Object.entries({
    ...(packagejson)['dependencies'] ?? {},
    ...(packagejson)['devDependencies'] ?? {},
} as Record<string, string>).reduce((state, [key, value]) => {
    const match = value.match(/^file:(.*)$/);

    if (match) {
        const path = nodefs.realpathSync(match[1]);
        state[key] = nodepath.resolve(nodepath.join(path, 'src'));
    }

    return state;
}, {} as Record<string, string>);

const config: Config.InitialOptions = {
    globals: {
        NODE_ENV: "test"
    },
    rootDir: '../',
    testEnvironment: 'node',
    transform: {
        "^.+.tsx?$": ["ts-jest", {
            tsconfig: "./test/tsconfig.json",
            diagnostics: true
        }]
    },
    moduleDirectories: ["node_modules", 'src'],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    moduleNameMapper: {
        //"^@/(.*)$": "<rootDir>/src/$1",
        ...jestAliases({ onJestAlias: true }),
        ...modules
    }
};

export default config;
