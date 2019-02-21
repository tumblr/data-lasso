var path = require('path');
/**

 * # Webpack Build Process for Data Lasso
 */

module.exports = (_, { mode }) => {
    const isProductionBuild = mode === 'production';
    const isMinimized = isProductionBuild && process.argv.indexOf('--nonminified') === -1;

    return {
        entry: path.join(__dirname, 'src/index.js'),
        devtool: isProductionBuild ? '' : 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'public'),
        },
        optimization: {
            minimize: isMinimized,
        },
        output: {
            filename: isMinimized ? 'datalasso.min.js' : 'datalasso.js',
            library: 'datalasso',
            libraryTarget: 'umd',
            publicPath: '/build/',
            path: path.join(__dirname, isProductionBuild ? 'build' : 'public/build'),
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.glsl$/,
                    use: 'shader-loader',
                },
            ],
        },
    };
};
