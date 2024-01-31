import nodepath from 'path';

import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import NodemonPlugin from 'nodemon-webpack-plugin';

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
        alias: {
            '@': nodepath.resolve(__dirname, '..', '..', 'src')
        }
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                use: ['ts-loader']
            }
        ]
    },
    plugins: [
        new NodemonPlugin(),
    ],
};

export default config;
