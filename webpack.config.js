const {
    resolve
} = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const devMode = process.env.NODE_ENV !== 'production'
const analyzeMode = process.env.ANALYZE_MODE === 'on'

module.exports = {
    ...{
        devtool: devMode ? "inline-source-map" : false,
        entry: {
            "taco": './src/index.ts',
            "taco_light": './src/index-light.ts',
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
    },
    ...analyzeMode && {
        plugins: [
            new BundleAnalyzerPlugin(),
        ],
    }
};