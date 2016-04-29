'use strict';

var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

/**
 * # Webpack Build Process for Data Lasso
 *
 * Run with `--production` to build minified production ready distributive
 */

var production = (process.argv.indexOf('--production') >= 0);

function getStylesheetLoader() {
    if (production) {
        return 'style-loader!css-loader!postcss-loader!sass-loader';
    } else {
        return 'style-loader?sourceMap!css-loader?sourceMap!postcss-loader!sass-loader?sourceMap';
    }
}

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
                loader: getStylesheetLoader(),
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
