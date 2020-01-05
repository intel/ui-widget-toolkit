const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DtsBundleWebpack = require('dts-bundle-webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpackAngularExternals = require('webpack-angular-externals');
var merge = require('webpack-merge');

let common = {
    name: 'framework',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'framework/[name]/index.js',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: [
        webpackAngularExternals(),
        {
            'ui-widget-toolkit': 'ui-widget-toolkit',
            d3: 'd3',
            'd3-sankey': {
                root: 'Sankey',
                commonjs2: 'd3-sankey',
                amd: 'd3-sankey',
                commonjs: 'd3-sankey'
            },
            dagre: 'dagre',
            'es6-promise': 'es6-promise',
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
    ],
    resolve: {
        extensions: ['.ts', '.js', 'jsx', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'react': 'react',
            '@angular': '@angular',
            'ui-widget-toolkit': 'ui-widget-toolkit'
        }
    },
    module: {
        rules: [
            {
                test: /\.(jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-react']
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
                    appendTsSuffixTo: [/\.vue$/]
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
    }
}

module.exports = [
    merge(common, {
        entry: {
            'angular1': path.resolve(__dirname, 'src/framework/angular1/index.js')
        },
        output: {
            library: ['UWTAngularJS']
        }
    }),
    merge(common, {
        entry: {
            'vue': path.resolve(__dirname, 'src/framework/vue/index.js')
        },
        output: {
            library: ['UWTVue'],
            libraryExport: 'default'
        },
        plugins: [
            // make sure to include the plugin!
            new VueLoaderPlugin()
        ]
    }),
    merge(common, {
        entry: {
            'react': path.resolve(__dirname, 'src/framework/react/index.js')
        },
        output: {
            library: ['UWTReact']
        }
    }),
    merge(common, {
        entry: {
            'angular2': path.resolve(__dirname, 'src/framework/angular2/index.ts')
        },
        output: {
            library: ['UWTAngular']
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
            }),
            new CopyWebpackPlugin([
                { from: './src/framework/polymer', to: 'framework/polymer' },
                { from: './src/framework/polymer2', to: 'framework/polymer2' },
                { from: './package.json', to: '.' },
                { from: './LICENSE', to: '.' },
                { from: './bower.json', to: '.' },
                { from: './third-party-programs.txt', to: '.' }
            ])
        ],
        resolve: {
            alias: {
                'ui-widget-toolkit': path.resolve(__dirname, 'dist/js'),
            }
        }
    })
]
