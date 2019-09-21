import path from 'path'
import {Configuration} from "webpack";

const config: Configuration =  {
    mode: "production",
    entry: path.resolve(__dirname, '../js/highlight.js'),
    output: {
        path: path.resolve(__dirname, '../dist/js'),
        filename: 'highlight.js'
    },
    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.js']
    }
};

export default config;

