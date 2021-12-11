import { Base, StyleSheet } from "../src/templates/base";
import { Post as PostComponent } from "../src/templates/post";
import {
  copyFile,
  CWD,
  ensureDir,
  ensureFile,
  readDir,
  readFileContent,
  recursiveReaddir,
  writeFile,
} from "./io";
import { contentHash } from "./hash";
import { path } from "./path";
import { Home, meta as homeMeta } from "../src/pages/home";
import { generateFeed } from "./feed-generator";
import { getLog } from "./git";
import { mdToHtml } from "./md-parser";
import { renderToString } from "react-dom/server";

const distDir = `${CWD}/dist`;
const srcRoot = `${CWD}/src`;
const ouputAsetsDir = `assets`;

type ImagePathMap = Map<string, string>;

type ScriptPathMap = Map<string, string>;

type Subresources = {
  styles: Map<string, string>;
  scripts: ScriptPathMap;
  images: ImagePathMap;
};

const parseFileName = (fileName: string): ParseFileNameResult => {
  const regexp = /^(\d{4}-\d{2}-\d{2})-(.*)\.md$/;
  const matched = fileName.match(regexp);
  if (!matched) throw `${fileName} is invalid filename format`;
  const [_, date, name] = matched;
  return {
    date,
    fileName: name,
  };
};

const getPosts = async (): Promise<Posts> => {
  const postsDir = `${srcRoot}/posts`;
  const posts: Posts = [];
  for await (const dirEntry of await readDir(postsDir, {
    withFileTypes: true,
  })) {
    const { fileName, date } = parseFileName(dirEntry.name);
    const content = await readFileContent(`${postsDir}/${dirEntry.name}`);

    const changeLogs = await getLog(`${postsDir}/${dirEntry.name}`);

    const { content: parsed, title, description } = await mdToHtml(content);

    // const { title } = parsed.meta;
    const post: Post = {
      content: parsed,
      date,
      tags: [],
      title,
      url: `posts/${date}/${fileName}.html`,
      ampUrl: `posts/${date}/${fileName}.amp.html`,
      canonicalUrl: `https://blog.araya.dev/posts/${date}/${fileName}.html`,
      changeLogs,
      description,
    };
    posts.push(post);
  }
  return posts;
};

const replaceJsModulePaths = async (
  filePath: string,
  moduleMap: Map<string, string>
): Promise<void> => {
  let content = await readFileContent(filePath);
  for (const key of moduleMap.keys()) {
    content = content.replaceAll(key, moduleMap.get(key) ?? key);
  }
  await writeFile(filePath, content);
};

const buildAssets = async (srcDir: string): Promise<Map<string, string>> => {
  const map = new Map();
  const builtAssets: string[] = [];
  for (const file of await recursiveReaddir(srcDir)) {
    const ext = path.extname(file).toLowerCase();
    const out = `${distDir}${file
      .replace(srcRoot, "")
      .replace(ext, "")}-${contentHash(
      (await readFileContent(file)).toString()
    )}${ext}`;
    await ensureFile(out);
    map.set(file.replace(srcRoot, ""), out.replace(distDir, ""));
    try {
      await copyFile(file, out);
    } catch (e) {
      console.error(e);
    }
    builtAssets.push(out);
    for (const asset of builtAssets) {
      if (asset.endsWith(".js")) replaceJsModulePaths(asset, map);
    }
  }
  console.log(map)
  return map;
};

const defaultStyleSheets = ["main.css", "lib/normalize.css"];

const buildPostPages = async ({ scripts, styles, images }: Subresources) => {
  const posts = await getPosts();

  const replace = (content: string): string => {
    let replaced = content;
    for (const key of images.keys()) {
      replaced = replaced.replaceAll(key, images.get(key) ?? key);
    }
    for (const key of scripts.keys()) {
      replaced = replaced.replaceAll(key, scripts.get(key) ?? key);
    }
    for (const key of styles.keys()) {
      replaced = replaced.replaceAll(key, styles.get(key) ?? key);
    }
    return replaced;
  };

  const stylesheets: Array<StyleSheet> = [
    ...defaultStyleSheets,
    "markdown.css",
    "post.css",
    "lib/highlight.js/dracula.css",
  ].map((name) => ({
    href: `/styles/${name}`,
    rel: "prefetch",
  }));

  for (const post of posts) {
    const outputFilePath = `${distDir}/${post.url}`;
    await ensureFile(outputFilePath);
    const html = renderToString(
      <Base
        styles={stylesheets}
        title={post.title}
        scripts={[
          { src: "/js/post.js", module: true },
          { src: "/js/main.js", module: true },
        ]}
      >
        <PostComponent
          title={post.title}
          date={post.date}
          changeLogs={post.changeLogs}
        >
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </PostComponent>
      </Base>
    );
    await writeFile(outputFilePath, replace(html));
  }
};

const buildPages = async ({ styles, images, scripts }: Subresources) => {
  const posts = (await getPosts()).sort((a, b) => (a.date < b.date ? 1 : -1));
  const outputFilePath = `${distDir}/index.html`;
  await ensureFile(outputFilePath);
  const replace = (content: string): string => {
    let replaced = content;
    for (const key of images.keys()) {
      replaced = replaced.replaceAll(key, images.get(key) ?? key);
    }
    for (const key of scripts.keys()) {
      replaced = replaced.replaceAll(key, scripts.get(key) ?? key);
    }
    for (const key of styles.keys()) {
      replaced = replaced.replaceAll(key, styles.get(key) ?? key);
    }
    return replaced;
  };
  const html = renderToString(
    <Base
      styles={[...defaultStyleSheets, ...homeMeta.styles].map((styleName) => ({
        href: `/styles/${styleName}`,
        rel: "prefetch",
      }))}
      title={homeMeta.title}
      scripts={[{ src: "/js/main.js", module: true }]}
    >
      <Home posts={posts} />
    </Base>
  );
  await writeFile(outputFilePath, replace(html));
};

export async function build() {
  const [styles, scripts, images] = await Promise.all([
    buildAssets(`${srcRoot}/styles`),
    buildAssets(`${srcRoot}/js`),
    buildAssets(`${srcRoot}/assets`),
  ]);

  await Promise.all([
    buildPages({ scripts, images, styles }),
    buildPostPages({ scripts, images, styles }),
  ]);

  await generateFeed(await getPosts(), distDir);
}
try {
  await ensureDir(distDir);
  await ensureDir(`${distDir}/${ouputAsetsDir}`);
  await build();
} catch (e) {
  console.error(e);
  process.exit(1);
}
