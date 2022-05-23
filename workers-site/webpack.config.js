module.exports = {
    target: 'webworker',
    context: __dirname + '/..',
    entry: './workers-site/index.js',
    mode: 'development',
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    // Disables attributes processing
                    attributes: false,
                },
            },
        ],
    },
}
