const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')

module.exports = {
    mode: 'development',
    entry: {
        vueTest: path.resolve(__dirname, 'vueTest.ts'),
    },
    output: {
        filename: 'vueTest.js',
        path: __dirname
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'ui-widget-toolkit': path.resolve(__dirname, '../../dist')
        }
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
            { test: /\.vue?$/, loader: 'vue-loader' },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        // make sure to include the plugin!
        new VueLoaderPlugin()
    ]
}
