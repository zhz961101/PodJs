const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");
const BaseConfig = require('./webpack.config');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    ...(BaseConfig || {}),
    plugins: [
        ...(BaseConfig.plugins || []),
        new EsmWebpackPlugin()
    ],
    output: {
        ...(BaseConfig.output || {}),
        libraryTarget: "var",
        filename: devMode ? '[name].esm.js' : '[name].esm.min.js',
    },
};