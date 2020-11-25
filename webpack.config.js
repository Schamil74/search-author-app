const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const StylelintPlugin = require('stylelint-webpack-plugin')
const IconfontPlugin = require('iconfont-plugin-webpack')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const dotenv = require('dotenv').config()
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const PrettierPlugin = require('prettier-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const SRC_PATH = process.env.SRC_PATH
const DIST_PATH = process.env.DIST_PATH
const PUBLIC_PATH = process.env.PUBLIC_PATH

const paths = {
    src: path.resolve(__dirname, SRC_PATH),
    dist: path.resolve(__dirname, DIST_PATH),
}

const pageDirTemplate = paths.src
const pages = fs
    .readdirSync(pageDirTemplate)
    .filter(fileName => fileName.endsWith('.pug'))

const optimization = () => {
    const config = {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        )[1]
                        return `npm.${packageName.replace('@', '')}`
                    },
                },
                styles: {
                    test: /\.css$/,
                    name: 'styles',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        { discardComments: { removeAll: true } },
                    ],
                },
            }),
            new TerserWebpackPlugin({
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ]
    }

    return config
}

const filename = ext => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`)

const cssLoaders = extra => {
    const loaders = [
        isDev
            ? 'style-loader'
            : {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                      hmr: isDev,
                      reloadAll: true,
                  },
              },
        {
            loader: 'css-loader',
            options: {
                sourceMap: isDev,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                sourceMap: isDev,
                config: { path: `./postcss.config.js` },
            },
        },
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const jsLoaders = extra => {
    const loaders = ['babel-loader']

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const plugins = () => {
    const base = [
        ...pages.map(
            page =>
                new HTMLWebpackPlugin({
                    template: pageDirTemplate + '/' + page,
                    filename: page.replace(/\.pug/, '.html'),
                    minify: {
                        collapseWhitespace: isProd,
                    },
                })
        ),

        new MiniCssExtractPlugin({
            filename: 'css/' + filename('css'),
        }),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: paths.src + '/static',
                    to: paths.dist + '/static',
                },
                {
                    from: paths.src + '/fonts',
                    to: paths.dist + '/fonts',
                },
                {
                    from: paths.src + '/img',
                    to: paths.dist + '/img',
                },
                { from: paths.src + '/.htaccess', to: paths.dist },
                {
                    from: paths.src + '/service-worker.js',
                    to: paths.dist,
                },
            ],
        }),
        new IconfontPlugin({
            src: paths.src + '/svg',
            family: 'iconfont',
            dest: {
                font: paths.src + '/fonts/iconfont/[family].[type]',
                css: paths.src + '/components/system/styles/[family].scss',
            },
            watch: {
                pattern: paths.src + 'svg/*.svg',
            },
        }),

        ...pages.map(
            page =>
                new FaviconsWebpackPlugin({
                    logo: paths.src + '/favicon/favicon.svg',
                    publicPath: PUBLIC_PATH,
                    prefix: 'static/',
                    inject: htmlPlugin => {
                        return (
                            path.basename(htmlPlugin.options.filename) ===
                            page.replace(/\.pug/, '.html')
                        )
                    },
                })
        ),

        new webpack.DefinePlugin({
            'process.env': JSON.stringify(dotenv.parsed),
        }),

        new PrettierPlugin(),

        new CleanWebpackPlugin(),
    ]

    if (isDev) {
        base.push(
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map[query]',
                exclude: /vendors~*.*/,
            }),
            new StylelintPlugin({
                fix: true,
            })
        )
    } else {
        base.push(new BundleAnalyzerPlugin())
    }

    return base
}

module.exports = {
    context: paths.src,
    entry: {
        app: './main.ts',
    },
    output: {
        publicPath: PUBLIC_PATH,
        path: paths.dist,
        filename: 'js/' + filename('js'),
    },
    resolve: {
        extensions: ['.js', '.jsx', '.tsx', '.ts', '.scss', '.css'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: path.resolve(__dirname, 'tsconfig.json'),
            }),
        ],
        alias: {
            '@': paths.src,
        },
    },
    optimization: optimization(),
    devServer: {
        compress: true,
        port: 8000,
        // для локального тестирования
        // host: '192.168.0.106',
        hot: isDev,
        historyApiFallback: true,
        overlay: {
            warnings: true,
            errors: true,
        },
        stats: {
            normal: true,
        },
    },
    devtool: isDev ? 'cheap-module-eval-source-map' : '',
    resolveLoader: {
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                use: ['raw-loader', 'pug-plain-loader'],
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: jsLoaders(),
            },
            {
                test: /\.(ts)$/,
                use: jsLoaders('ts-loader'),
            },
            {
                test: /\.css$/,
                use: cssLoaders(),
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders({
                    loader: 'sass-loader',
                    options: {
                        sourceMap: isDev,
                        sassOptions: {
                            includePaths: [
                                path.resolve(__dirname, 'node_modules'),
                            ],
                        },
                    },
                }),
            },
            {
                test: /\.s[ac]ss$/,
                exclude: [path.resolve(__dirname, 'src/components/system')],
                loader: 'import-glob-loader',
            },
            {
                test: /\.(ttf|woff|woff2|eot|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
    plugins: plugins(),
}
