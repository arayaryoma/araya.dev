import * as path from "path";
import * as fs from "fs";
import * as showdown from "showdown";
import * as yaml from "js-yaml";
import {render, configure} from "nunjucks";
import {src, dest, parallel, series, watch as gulpWatch} from "gulp";
import {sortBy} from "lodash";
import webpackConf from "./webpack.config";
import {Stats} from "webpack";
import {generateFeed} from "./feed-generator";

const webpack = require("webpack");

const fsPromises = fs.promises;
const parser = new showdown.Converter({metadata: true, tables: true});
const postsDir = path.resolve(__dirname, "../posts");
const distDir = path.resolve(__dirname, "../dist");

const readdirRecursively = async (
    dir: string,
    files: string[] = []
): Promise<string[]> => {
    const dirents = await fsPromises.readdir(dir, {withFileTypes: true});
    const dirs = [];
    for (let dirent of dirents) {
        if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
        if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
    }
    for (let d of dirs) {
        files = await readdirRecursively(d, files);
    }
    return Promise.resolve(files);
};

const loadPostsList = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(postsDir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(files);
        });
    });
};

const loadFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, file) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(file.toString());
        });
    });
};

const writeFile = async (filename: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, content, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const parseMetadata = (raw: string) => {
    return yaml.safeLoad(raw);
};

const parseFileName = (fileName: string): ParseFileNameResult => {
    const regexp = /^(\d{4}-\d{2}-\d{2})-(.*)\.md$/;
    const matched = fileName.match(regexp);
    if (!matched) throw `${fileName} is invalid filename format`;
    const [_, date, name] = matched;
    return {
        date,
        fileName: name
    };
};

const mkdir = async (path: string): Promise<void> => {
    return new Promise(resolve => {
        fs.mkdir(path, {recursive: true}, () => {
            resolve();
        });
    });
};

const getPosts = async (): Promise<Posts> => {
    const files = await loadPostsList();
    const posts: Posts = [];
    for (let file of files) {
        const {date, fileName} = parseFileName(file);
        const content = await loadFile(`${postsDir}/${file}`);
        const parsed = parser.makeHtml(content);
        const metadata = parser.getMetadata(true);
        const {title, tags} = parseMetadata(metadata as string);
        const post: Post = {
            content: parsed,
            date,
            tags,
            title,
            url: `posts/${date}/${fileName}.html`,
            ampUrl: `posts/${date}/${fileName}.amp.html`,
            canonicalUrl: `https://blog.araya.dev/posts/${date}/${fileName}.html`
        };
        posts.push(post);
    }
    return posts;
};

const buildTemplates = async () => {
    configure('../templates/')
    await mkdir(`${distDir}/posts`);
    const posts = await getPosts();
    for (const post of posts) {
        const html = render('post.njk', post);
        const amp = render('post.amp.njk', post);
        await mkdir(`${distDir}/posts/${post.date}`);
        await writeFile(`${distDir}/${post.url}`, html).catch(err => {
            throw err;
        });
        await writeFile(`${distDir}/${post.ampUrl}`, amp).catch(err => {
            throw err;
        });

    }
    const indexHtml = render('index.njk', {
        posts: sortBy(posts, p => p.date).reverse()
    });
    await writeFile(`${distDir}/index.html`, indexHtml).catch(err => {
        throw err;
    });
};

const copyStyles = () => {
    return src("../styles/**/*.css").pipe(dest(`${distDir}/styles`));
};
const copyAssets = () => {
    return src("../assets/**/*").pipe(dest(`${distDir}/assets`));
};

const bundle = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        webpack(webpackConf, (error: Error, stats: Stats) => {
            if (error || stats.hasErrors()) {
                console.error(error, stats);
                reject(error);
            }
            resolve();
        });
    });
};
const feed = series(async () => {
    const posts = await getPosts();
    await generateFeed(posts);
});
const build = parallel(buildTemplates, copyStyles, copyAssets, bundle, feed);
const watch = series(build, () => {
    gulpWatch(["../templates/**/*", "../posts/**/*"], series(buildTemplates));
    gulpWatch(["../styles/**/*"], series(copyStyles));
    gulpWatch(["../assets/**/*"], series(copyAssets));
    gulpWatch(["../js/**/*"], series(bundle));
});
export {build, watch};
