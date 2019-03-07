const path = require('path')

module.exports = {
    entry: {
        angular2test: path.resolve(__dirname, 'main.ts')
    },
    output: {
        filename: 'angular2test.js',
        path: __dirname
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            'ui-widget-toolkit': path.resolve(__dirname, '../../dist')
        }
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
}
