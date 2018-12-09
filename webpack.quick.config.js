// 本地快速测试编译
// 不用babel，只做打包和sourcemap
// -----------------------------
const webpack = require('webpack');
const CleanWebpackPlugin = require("clean-webpack-plugin");
const {
    resolve
} = require('path');

module.exports = {
    devtool : "#cheap-module-eval-source-map",
    entry: {
        Poi: resolve(__dirname, "./src/index.js")
    },
    output: {
        path: resolve(__dirname, "./dist"),
        filename: "./[name].bundle.js"
    },
    module: {
        rules: [{
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/
            }]
    },
    plugins: [
        new CleanWebpackPlugin(
            ['./dist/*.*'], {
                root: resolve(__dirname, "./"),
                verbose: true,
                dry: false
            })
    ]
}
