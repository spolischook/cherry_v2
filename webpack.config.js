'use strict';

const path = require('path'),
    useDevServer = false,
    isProduction = process.env.NODE_ENV === 'production',
    useVersioning = true,
    useSourceMaps = !isProduction,
    publicPath = useDevServer ? 'http://localhost:8080/build/' : '/build/',
    webpack = require('webpack'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ManifestPlugin = require('webpack-manifest-plugin'),
    WebpackChunkHash = require('webpack-chunk-hash'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: useSourceMaps,
            minimize: isProduction,
        }
    },
    sassLoader = {
        loader: 'sass-loader',
        options: {
            sourceMap: true
        }
    },
    styleLoader = {
        loader: 'style-loader',
        options: {
            sourceMap: useSourceMaps
        }
    },
    resolveUrlLoader = {
        loader: 'resolve-url-loader',
        options: {
            sourceMap: useSourceMaps
        }
    },
    fileLoader = {
        loader: "file-loader",
        options: {
            name: '[name]-[hash:6].[ext]'
        }
    };

const webpackConfig = {
    entry: {
        main: './assets/entry.js',
    },
    output: {
        path: path.resolve(__dirname, 'public', 'build'),
        filename: useVersioning ?  '[name].[chunkhash:6].js' : "[name].js",
        publicPath: publicPath,
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
        }),
        new CopyWebpackPlugin([
            { from: './assets/static', to: 'static' }
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            names: [
                'main',
                'manifest'
            ],
            minChunks: Infinity
        }),
        new ExtractTextPlugin(
            useVersioning ? '[name].[contenthash:6].css' : '[name].css'
        ),
        new ManifestPlugin({
            writeToFileEmit: true,
            basePath: 'build/',
        }),
        new WebpackChunkHash(),
        isProduction ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin(),
        new CleanWebpackPlugin('public/build/**/*.*'),
    ],
    devtool: useSourceMaps ? "inline-source-map" : false,
    devServer: {
        contentBase: './public',
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true
                    }
                },
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        cssLoader,
                    ],
                    fallback: styleLoader,
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        cssLoader,
                        resolveUrlLoader,
                        sassLoader,
                    ],
                    fallback: styleLoader,
                })

            },
            {
                test: /\.(png|jpg|jpeg|gif|ico|svg)$/,
                use: fileLoader
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: fileLoader
            },
            {
                test: /\.hbs$/,
                use: "handlebars-loader"
            },
        ]
    }
};

if (isProduction) {
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    webpackConfig.plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        })
    );
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    );
}

module.exports = webpackConfig;
