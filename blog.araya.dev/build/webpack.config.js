const path = require('path');

module.exports = {
    mode: "production",
    entry: path.resolve('../js/highlight.js'),
    output: {
        path: path.resolve('../dist/js'),
        filename: 'highlight.js'
    },
    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.js']
    }
};
