var path = require('path');
var webpack = require('webpack');
var generateRefs = require('./build/generate-refs.js');
var packageExtractCssPlugin = require('package-webpack-extract-css-plugin');

// 需要手动从fekit.config工程中copy exports部分到这里
var exports = {exports}

console.log('工程输出文件数量:' + exports.length);

var webpackExport = {},
    extensionPattern = /(\.js|\.css|\.scss)/i,
    rootPrefix = './src/';

exports.forEach(function(output) {
    output = typeof output === 'object' ? output.path : output;

    var key = output.replace(extensionPattern, '');

    webpackExport[key] = rootPrefix + output;
});

// 生成ref文件夹，其中包括vm、ver文件
generateRefs(exports);

module.exports = {
    originExports: exports,
    entry: webpackExport,
    output: {
        path: './prd',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.es6$/,
            loader: 'babel-loader'
        }, {
            test: /\.string$/,
            loader: 'package-webpack-string-loader'
        }, {
            test: /\.less$/,
            loader: 'package-webpack-css-loader!less-loader'
        }, {
            test: /\.scss$/,
            loader: 'package-webpack-css-loader!sass-loader'
        }, {
            test: /\.css$/,
            loader: 'package-webpack-css-loader'
        }, {
            test: /\.mustache$/,
            loader: 'package-webpack-mustache-loader'
        }]
    },
    resolve: {
        root: process.cwd(),
        alias: {alias},
        modulesDirectories: ['node_modules', 'fekit_modules'],
        extensions: ['', '.css', '.scss', '.jsx', '.js', '.webpack.js', '.web.js', '.mustache', '.string']
    },
    plugins: [new packageExtractCssPlugin()]
};