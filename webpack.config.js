const {
    resolve
} = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production'
const analyzeMode = process.env.ANALYZE_MODE === 'on'

console.log({
    devMode,
    analyzeMode
})

module.exports = {
    ...{
        devtool: devMode ? "inline-source-map" : false,
        entry: {
            "taco": './src/index.ts',
        },
        output: {
            library: "taco",
            libraryTarget: "umd",
            filename: devMode ? '[name].js' : '[name].min.js',
            path: resolve(__dirname, 'dist')
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
                '.ts', ".js", ".jsx", "tsx"
            ]
        },
        optimization: {
            minimize: !devMode,
            minimizer: [new TerserPlugin({
                terserOptions: {
                    parse: {},
                    compress: {},
                    module: false,
                    keep_classnames: false,
                    keep_fnames: false,
                    ie8: false,
                    safari10: false,
                },
            })],
            sideEffects: true,
            usedExports: true,
        }
    },
    ...(analyzeMode ? {
        plugins: [new BundleAnalyzerPlugin()]
    } : {})
    // plugin: [
    //     ...(analyzeMode ? [new BundleAnalyzerPlugin()] : [])
    // ]
};