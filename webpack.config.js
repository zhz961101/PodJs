// const webpack = require('webpack');
// const CleanWebpackPlugin = require("clean-webpack-plugin");
const {
    resolve
} = require('path');

module.exports = {
    entry: {
        poi: resolve(__dirname, "./src/index.js"),
        mixin: resolve(__dirname, "./src/mixin/index.js"),
    },
    output: {
        path: resolve(__dirname, "./dist"),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        "@babel/plugin-transform-regenerator",
                        "transform-remove-strict-mode"
                    ]
                }
            }
        }]
    }
}