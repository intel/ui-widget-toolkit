const path = require('path')

module.exports = {
    entry: {
        reactTest: path.resolve(__dirname, 'reactTest.jsx')
    },
    output: {
        filename: 'reactTest.js',
        path: __dirname
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.js', '.jsx'],
        alias: {
            'ui-widget-toolkit': path.resolve(__dirname, '../../dist')
        }
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.(js|jsx)$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['react']
                    }
                }],

                exclude: /node_modules/,

            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}
