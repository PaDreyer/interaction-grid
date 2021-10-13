const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: "./src/index.ts"
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.normalize(path.join(__dirname, "dist")),
        clean: true,
    },
    devServer: {
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Canvasify",
            template: "./public/index.html",
        })
    ]
}