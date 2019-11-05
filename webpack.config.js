const path = require('path');
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    devtool: devMode ? "inline-source-map" : false,
    entry: {
        // "browser": './src/browser.ts',
        "taco": './src/index.ts'
    },
    output: {
        library: "Taco",
        libraryTarget: "umd",
        filename: devMode ? '[name].js' : '[name].min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /(node_modules|bower_components)/,
        }]
    },
    resolve: {
        extensions: [
            '.ts'
        ]
    }
};