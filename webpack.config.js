'use strict';

var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

/**
 * # Build process for Data Lasso
 *
 * `default` task build Data Lasso and serves it up locally
 *
 * Pass --production to build data lasso only
 */

var production = process.argv.indexOf('--production');

var webpackConfig = {
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'datalasso.js',
        library: 'datalasso',
        libraryTarget: 'umd',
        publicPath: '/build/',
        path: production ? path.join(__dirname, 'build') : path.join(__dirname, 'public/build'),
    },
    watch: !production,
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!postcss-loader!sass-loader',
            },
            {
                test: /\.glsl$/,
                loader: 'shader',
            },
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react'],
                },
            },
        ],
    },
    devtool: production ? '' : 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
    },
    sassLoader: {
        sourcemap: !production,
    },
    postcss: [
        autoprefixer({
            browsers: [
                'last 3 versions',
            ],
        }),
    ],
};

if (production) {
    console.log('PRODUCTION BUILD');
    webpackConfig.plugins = [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
    ];
}


module.exports = webpackConfig;
