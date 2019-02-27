module.exports = {
    entry: {
        angular2test: './examples-frameworks/angular2/main.ts',
    },
    output: {
        filename: 'angular2test.js',
        path: __dirname
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
}
