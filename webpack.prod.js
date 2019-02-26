const path = require('path');
const libraryName = 'UWT';

module.exports = [
    {
        name: 'component-lib',
        mode: 'production',
        entry: {
            'ui-widget-toolkit-graph': path.resolve(__dirname, 'src/build/export.graph.ts'),
            'ui-widget-toolkit-chart': path.resolve(__dirname, 'src/build/export.chart.ts'),
            'ui-widget-toolkit-grid': path.resolve(__dirname, 'src/build/export.grid.ts'),
            'ui-widget-toolkit-decimator-worker': path.resolve(__dirname, 'src/core/cartesian/decimator/worker.ts')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'umd',
            library: [libraryName],
            filename: 'js/[name].min.js',
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
            }
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
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
        ]
    },
    {
        name: 'lib',
        mode: 'production',
        entry: {
            'ui-widget-toolkit': path.resolve(__dirname, 'src/index.ts')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'umd',
            library: [libraryName],
            filename: 'js/[name].min.js',
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
            '@angular': '@angular'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
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
]
