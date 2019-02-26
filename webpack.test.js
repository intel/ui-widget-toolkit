const path = require('path');

module.exports = [
    {
        name: 'test',
        mode: 'development',
        node: {
            fs: "empty",
            __dirname: true
        },
        entry: {
            'data': path.resolve(__dirname, 'spec/unit-test/src/data.js'),
            'decimator': path.resolve(__dirname, 'spec/unit-test/src/decimator.js')
        },
        output: {
            path: path.resolve(__dirname, 'spec/unit-test/'),
            filename: '[name].spec.js'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        externals: {
            fs: 'require("fs")'
        }
    }
]
