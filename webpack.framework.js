const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpackAngularExternals = require('webpack-angular-externals');

module.exports = [
    {
        name: 'framework',
        mode: 'development',
        entry: {
            'angular1': path.resolve(__dirname, 'src/framework/angular1/index.js'),
            'vue': path.resolve(__dirname, 'src/framework/vue/index.js'),
            'react': path.resolve(__dirname, 'src/framework/react/index.js')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'framework/[name]/index.js',
            libraryTarget: 'umd',
            library: ['UWT'],
            umdNamedDefine: true
        },
        externals: {
            d3: 'd3',
            'pixi.js': {
                root: 'PIXI',
                commonjs2: 'pixi.js',
                amd: 'pixi.js',
                commonjs: 'pixi.js'
            },
            'ag-grid-community': {
                root: 'agGrid',
                commonjs2: 'ag-grid-community',
                amd: 'ag-grid-community',
                commonjs: 'ag-grid-community'
            },
            vue: 'vue',
            'vue-material': 'vue-material',
            react: 'React'
        }
        ,
        resolve: {
            extensions: ['.ts', '.js', 'jsx', '.vue'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                'react': 'react'
            }
        },
        module: {
            rules: [
                {
                    test: /\.(jsx)$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    options: {
                        presets: ['react']
                    }
                },
                {
                    test: /\.vue?$/,
                    loader: 'vue-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.ts?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.worker\.js$/,
                    use: {
                        loader: 'worker-loader',
                        options: { inline: true }
                    }
                }
            ]
        },
        plugins: [
            // make sure to include the plugin!
            new VueLoaderPlugin(),
            new CopyWebpackPlugin([
                { from: './src/framework/polymer', to: 'framework/polymer' },
                { from: './src/framework/polymer2', to: 'framework/polymer2' },
                { from: './package.json', to: '.' },
                { from: './LICENSE', to: '.' },
                { from: './bower.json', to: '.' },
                { from: './third-party-programs.txt', to: '.' }
            ])
        ]
    },
    {
        name: 'angular',
        mode: 'development',
        entry: {
            'angular2': path.resolve(__dirname, 'src/framework/angular2/index.ts')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'framework/[name]/index.js',
            libraryTarget: 'umd',
            library: ['UWT'],
            umdNamedDefine: true
        },
        externals: [
            webpackAngularExternals(),
            {
                d3: 'd3',
                'pixi.js': {
                    root: 'PIXI',
                    commonjs2: 'pixi.js',
                    amd: 'pixi.js',
                    commonjs: 'pixi.js'
                },
                'ag-grid-community': {
                    root: 'agGrid',
                    commonjs2: 'ag-grid-community',
                    amd: 'ag-grid-community',
                    commonjs: 'ag-grid-community'
                }
            }
        ],
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@angular': '@angular'
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    }
                },
                {
                    test: /\.worker\.js$/,
                    use: {
                        loader: 'worker-loader',
                        options: { inline: true }
                    }
                }
            ]
        },
        plugins: [
            new DtsBundleWebpack({
                name: 'UWT',
                main: path.resolve(__dirname, 'types/framework/angular2/index.d.ts'),
                baseDir: path.resolve(__dirname, 'types'),
                out: path.resolve(__dirname, 'dist/framework/angular2/index.d.ts'),
                removeSource: false,
                outputAsModuleFolder: true,
                verbose: true
            })
        ]
    }
]
