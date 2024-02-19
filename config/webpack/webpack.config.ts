import nodepath from 'path';

import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import NodemonPlugin from 'nodemon-webpack-plugin';

import { unaliasTransformerFactory, webpackAliases } from 'ts-unalias';
const config: Configuration = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV === 'development' ? 'development' : 'none',
    devtool: 'inline-source-map',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        filename: 'index.js',
        path: nodepath.resolve(__dirname, '..', '..', 'dist'),
        library: {
            name: 'varcor',
            type: 'this'
        },
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
        mainFiles: ['index'],
        alias: webpackAliases(nodepath.resolve(__dirname, '..', '..'), { onWebpackAlias: '[ts-unalias:webpack]: ${item}' })
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: (program: any) => ({
                            afterDeclarations: [unaliasTransformerFactory(program, {
                                //onExternalModule: item => item.type === 'alias' ? console.log(item) : null,
                            })]
                        }),
                    },
                }]
            }
        ]
    },
    plugins: [
        new NodemonPlugin(),
    ],
};

export default config;
