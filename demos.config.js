const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dist = path.resolve(__dirname, 'dist');

const typingMonkeysDemo = {
    entry: path.resolve(__dirname, 'src/Demos/TypingMonkeys/Main.ts'),
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
    entry: path.resolve(__dirname, 'src/Demos/TravelingSalesman/Main.ts'),
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
    entry: path.resolve(__dirname, '/src/Demos/SmartEaters/Main.ts'),
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

const deblurDemo = {
    entry: path.resolve(__dirname, '/src/Demos/DeblurText/Main.ts'),
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
        filename: 'deblur.js',
        path: path.join(dist, 'DeblurText')
    },
    devServer: {
        contentBase: './dist/DeblurText',
        port: 1621
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Deblur Text'
        })
    ],
    devtool: 'inline-source-map'
};

module.exports = [
    // typingMonkeysDemo,
    // tspDemo,
    // smartEatersDemo,
    deblurDemo
];