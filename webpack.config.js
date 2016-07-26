var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

/**
 * # Webpack Build Process for Data Lasso
 *
 * Available arguments:
 *
 * --production
 * Removes JS and CSS source maps from the output; Sets up `NODE_ENV` variable to`production`.
 *
 * --watch
 * Makes webpack watch for changes
 *
 * --minified
 * Passes output through UglifyJs plugin and builds into `datalasso.min.js`. For use
 * without commonjs modules, such as Data Lasso hosted on GitHub pages
 *
 */

var production = (process.argv.indexOf('--production') >= 0);
var minified = (process.argv.indexOf('--minified') >= 0);
var watch = (process.argv.indexOf('--watch') >= 0);

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
    watch: watch,
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
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
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
    plugins: [],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};

if (production) {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production'),
        },
    }));
}

if (minified) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },
    }));
    webpackConfig.output.filename = 'datalasso.min.js';
}

module.exports = webpackConfig;
