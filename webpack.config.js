const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dist = path.resolve(__dirname, 'dist');

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
    // devtool: 'source-map'
};

const typingMonkeysDemo = {
    entry: './src/Demos/typingMonkeys/Main.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'typing_monkeys.js',
        path: path.join(dist, 'TypingMonkeys')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Randomly Typing Monkeys'
        })
    ]
    // devtool: 'inline-source-map'
};

const tspDemo = {
    entry: './src/Demos/TravelingSalesman/Main.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'tsp.js',
        path: path.join(dist, 'TSP')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Traveling Salesman'
        })
    ]
    // devtool: 'inline-source-map'
};

const smartEatersDemo = {
    entry: './src/Demos/SmartEaters/Main.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'eaters.js',
        path: path.join(dist, 'SmartEaters')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'SmartEaters'
        })
    ],
    devtool: 'inline-source-map'
};

const smartEatersAnalysis = {
    entry: './src/Demos/SmartEaters/AnalysisMain.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'analysis.js',
        path: path.join(dist, 'SmartEaters')
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'analysis.html',
            title: 'Eater Analysis'
        })
    ]
    // devtool: 'inline-source-map'
};

module.exports = [
    darwinUMD,
    typingMonkeysDemo,
    tspDemo,
    smartEatersDemo,
    smartEatersAnalysis
];