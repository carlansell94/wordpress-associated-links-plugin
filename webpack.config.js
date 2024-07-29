const CopyPlugin = require("copy-webpack-plugin");
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: './src/index.js',
    output: {
        path: __dirname + '/build',
        filename: 'index.js',
    },
    plugins: [
        ...defaultConfig.plugins,
        new CopyPlugin({
            patterns: [
                { from: 'src/editor.js', to: 'editor.js'},
                { from: 'src/sources.json', to: 'sources.json' },
                { from: 'assets/', to: 'assets/' },
            ],
        }),
    ],
};
