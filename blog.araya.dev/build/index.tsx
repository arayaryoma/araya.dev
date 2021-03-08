import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { Post } from "./types/index.d.ts";
import React from "https://dev.jspm.io/react";
import { ReactDOMServer } from "../deps.ts";

import { Base, StyleSheet } from "../templates/base.tsx";
import { Post as PostComponent } from "../templates/post.tsx";
import {
  copyFile,
  CWD,
  ensureDir,
  ensureFile,
  readDir,
  readFileContent,
  recursiveReaddir,
  writeFile,
} from "./io.ts";
import { contentHash } from "./hash.ts";
import { path } from "./path.ts";
import { Home, meta as homeMeta } from "../pages/home.tsx";
import { generateFeed } from "./feed-generator.ts";
import { getLog } from "./git.ts";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}

const distDir = `${CWD}/dist`;
const ouputAsetsDir = `assets`;

await ensureDir(distDir);
await ensureDir(`${distDir}/${ouputAsetsDir}`);

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
  const postsDir = `${CWD}/posts`;
  const decoder = new TextDecoder("utf-8");
  const posts: Posts = [];
  for await (const dirEntry of readDir(postsDir)) {
    const { fileName, date } = parseFileName(dirEntry.name);
    const content = await readFileContent(`${postsDir}/${dirEntry.name}`);

    const changeLogs = await getLog(`${postsDir}/${dirEntry.name}`);

    const parsed = Marked.parse(decoder.decode(content));

    const { title } = parsed.meta;
    const post: Post = {
      content: parsed.content,
      date,
      tags: "",
      title,
      url: `posts/${date}/${fileName}.html`,
      ampUrl: `posts/${date}/${fileName}.amp.html`,
      canonicalUrl: `https://blog.araya.dev/posts/${date}/${fileName}.html`,
      changeLogs,
    };
    posts.push(post);
  }
  return posts;
};

const buildAssets = async (srcDir: string): Promise<Map<string, string>> => {
  // const srcDir = `${CWD}/js`;
  const map = new Map();

  for (const file of await recursiveReaddir(srcDir)) {
    const ext = path.extname(file);
    const out = `${distDir}${file
      .replace(CWD, "")
      .replace(ext, "")}-${contentHash(
      (await readFileContent(file)).toString()
    )}${ext}`;
    await ensureFile(out);
    map.set(file.replace(CWD, ""), out.replace(distDir, ""));
    try {
      await copyFile(file, out);
    } catch (e) {
      console.error(e);
    }
  }
  return map;
};

const defaultStyleSheets = ["main.css", "lib/normalize.css"];

const buildPostPages = async ({ scripts, styles, images }: Subresources) => {
  const posts = await getPosts();
  const encorder = new TextEncoder();

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
    const html = ReactDOMServer.renderToString(
      <Base
        styles={stylesheets}
        title={post.title}
        scripts={[{ src: "/js/post.js", module: true }]}
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
    await writeFile(outputFilePath, encorder.encode(replace(html)));
  }
};

const buildPages = async ({ styles, images }: Subresources) => {
  const posts = (await getPosts()).sort((a, b) => (a.date < b.date ? 1 : -1));
  const encorder = new TextEncoder();
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
  const html = ReactDOMServer.renderToString(
    <Base
      styles={[...defaultStyleSheets, ...homeMeta.styles].map((styleName) => ({
        href: `/styles/${styleName}`,
        rel: "prefetch",
      }))}
      title={homeMeta.title}
    >
      <Home posts={posts} />
    </Base>
  );
  await writeFile(outputFilePath, encorder.encode(replace(html)));
};

const [styles, scripts, images] = await Promise.all([
  buildAssets(`${CWD}/styles`),
  buildAssets(`${CWD}/js`),
  buildAssets(`${CWD}/assets`),
]);

await Promise.all([
  buildPages({ scripts, images, styles }),
  buildPostPages({ scripts, images, styles }),
]);

await generateFeed(await getPosts(), distDir);
