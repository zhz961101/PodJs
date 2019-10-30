const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: devMode ? 'index.[hash:8].js' : 'index.min.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /(node_modules|bower_components)/,
        }, {
            test: /\.html$|\.css$/,
            use: "raw-loader",
            exclude: /(node_modules|bower_components)/,
        }]
    },
    resolve: {
        extensions: [
            '.ts'
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/index.html"),
            // favicon: path.resolve(__dirname, "./favicon.ico"),
        }),
        new CleanWebpackPlugin(),
    ]
};