import path from 'path';
import fs from 'fs';
import showdown from 'showdown';
import pug from 'pug';
import yaml from 'js-yaml';

const fsPromises = fs.promises;
const parser = new showdown.Converter({metadata: true});
const postsDir = path.resolve('./posts');
const distDir = path.resolve('./dist');
const postTemplateFile = path.resolve('./templates/post.pug');
const indexTemplateFile = path.resolve('./templates/index.pug');

const readdirRecursively = async (dir, files = []) => {
    const dirents = await fsPromises.readdir(dir, {withFileTypes: true});
    const dirs = [];
    for (let dirent of dirents) {
        if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
        if(dirent.isFile()) files.push(`${dir}/${dirent.name}`);
    }
    for (let d of dirs) {
       files = readdirRecursively(d, files)
    }
    return Promise.resolve(files);
};

const loadPostsList = () => {
    return new Promise(((resolve, reject) => {
        fs.readdir(postsDir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(files);
        });
    }))
};

const loadFile = (path) => {
    return new Promise(((resolve, reject) => {
        fs.readFile(path, (err, file) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(file.toString());
        })
    }))
};

const writeFile = (filename, content) => {
    return new Promise(((resolve, reject) => {
        fs.writeFile(filename, content, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        })
    }))
};
const parseMetadata = (raw) => {
    return yaml.safeLoad(raw)
};
const parseFileName = (fileName) => {
    const regexp = /^(\d{4}-\d{2}-\d{2})-(.*)\.md$/;
    const [_, date, name] = fileName.match(regexp);
    return {
        date, fileName: name
    }
};

const mkdir = (path) => {
    return new Promise(((resolve, reject) => {
        fs.mkdir(path, {recursive: true}, () => {
            resolve();
        });
    }));
};

(async () => {
    const stylesheets = await readdirRecursively(path.resolve('./styles/'));
    for(const stylesheet of stylesheets) {
        fsPromises.copyFile(stylesheet, distDir);
    }
    const files = await loadPostsList();
    await mkdir(`${distDir}/posts`);
    const posts = [];
    for (let file of files) {
        const {date, fileName} = parseFileName(file);
        const content = await loadFile(`${postsDir}/${file}`);
        const parsed = parser.makeHtml(content);
        const metadata = parser.getMetadata(true);
        const {title, tags} = parseMetadata(metadata);
        const html = pug.renderFile(postTemplateFile, {
            content: parsed,
            title,
            date,
            tags
        });
        await mkdir(`${distDir}/posts/${date}`);
        writeFile(`${distDir}/posts/${date}/${fileName}.html`, html).catch(err => console.error(err));
        posts.push({
            date,
            title,
            url: `/posts/${date}/${fileName}.html`
        })
    }
    const indexHtml = pug.renderFile(indexTemplateFile, {
        posts
    });
    writeFile(`${distDir}/index.html`, indexHtml).catch(err => console.error(err));
})();

