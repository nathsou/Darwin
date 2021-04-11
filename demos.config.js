const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dist = path.resolve(__dirname, 'dist');

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
    ]
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
};

module.exports = [
    typingMonkeysDemo,
    tspDemo,
    smartEatersDemo,
    smartEatersAnalysis
];