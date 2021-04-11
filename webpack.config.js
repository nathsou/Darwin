const path = require('path');

const darwinUMD = {
    entry: './src/Darwin.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /Demos/,
                /node_modules/,
                /lib/,
                /dist/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'darwin.js',
        path: path.join(__dirname, 'dist'),
        library: 'darwin',
        libraryTarget: 'umd',
        globalObject: "(typeof window !== 'undefined' ? window : this)"
    }
};

module.exports = [darwinUMD];