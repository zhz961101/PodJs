const path = require('path');
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: './src/mvvm.ts',
    output: {
        filename: devMode ? 'index.js' : 'index.min.js',
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