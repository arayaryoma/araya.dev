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

type Subresources = {
  styles: Record<string, string>;
  scripts: Record<string, string>;
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
    };
    posts.push(post);
  }
  return posts;
};

type ImagePathMap = Map<string, string>;

const buildImages = async (): Promise<ImagePathMap> => {
  const assetsDir = `${CWD}/assets`;
  const map = new Map();

  for (const file of await recursiveReaddir(assetsDir)) {
    const ext = path.extname(file);
    const out =
      distDir +
      `${file.replace(CWD, "").replace(ext, "")}-${contentHash(
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

const buildStyleSheets = async (): Promise<Record<string, string>> => {
  const stylesDir = `${CWD}/styles`;
  const stylesheets = {};
  for await (const dirEntry of readDir(stylesDir)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".css")) {
      const name = dirEntry.name.replace(".css", "");
      try {
        const hash = contentHash(
          (await readFileContent(`${stylesDir}/${dirEntry.name}`)).toString()
        );
        const outputFileName = `${ouputAsetsDir}/${name}-${hash}.css`;
        await copyFile(
          `${stylesDir}/${dirEntry.name}`,
          `${distDir}/${outputFileName}`
        );
        Object.assign(stylesheets, { [name]: outputFileName });
      } catch (e) {
        console.error(e);
        console.error(stylesDir + dirEntry.name);
        throw new Error("Failed to load stylesheets");
      }
    }
  }
  return stylesheets;
};

const defaultStyleSheets = ["main"];

const buildPostPages = async ({ styles, images }: Subresources) => {
  const posts = await getPosts();
  const encorder = new TextEncoder();
  const replace = (content: string): string => {
    let replaced = content;
    for (const key of images.keys()) {
      replaced = replaced.replaceAll(key, images.get(key) ?? key);
    }
    return replaced;
  };
  for (const post of posts) {
    const outputFilePath = `${distDir}/${post.url}`;
    await ensureFile(outputFilePath);
    const stylesheets: Array<StyleSheet> = [
      ...defaultStyleSheets.map<StyleSheet>((name) => ({
        href: `${styles[name]}`,
        rel: "prefetch",
      })),
      { href: `/${styles.post}`, rel: "prefetch" },
      { href: `/${styles.markdown}`, rel: "prefetch" },
    ];
    const html = ReactDOMServer.renderToString(
      <Base styles={stylesheets} title={post.title}>
        <PostComponent title={post.title} date={post.date}>
          <div dangerouslySetInnerHTML={{ __html: replace(post.content) }} />
        </PostComponent>
      </Base>
    );
    await writeFile(outputFilePath, encorder.encode(html));
  }
};

const buildPages = async ({ styles, images }: Subresources) => {
  const posts = await getPosts();
  const encorder = new TextEncoder();
  const outputFilePath = `${distDir}/index.html`;
  await ensureFile(outputFilePath);
  const replace = (content: string): string => {
    let replaced = content;
    for (const key of images.keys()) {
      replaced = replaced.replaceAll(key, images.get(key) ?? key);
    }
    return replaced;
  };
  const html = ReactDOMServer.renderToString(
    <Base
      styles={[...defaultStyleSheets, ...homeMeta.styles].map((styleName) => ({
        href: `/${styles[styleName]}`,
        rel: "prefetch",
      }))}
      title={homeMeta.title}
    >
      <Home posts={posts} />
    </Base>
  );
  await writeFile(outputFilePath, encorder.encode(replace(html)));
};

const styles = await buildStyleSheets();

const images = await buildImages();

await Promise.all([
  buildPages({ styles, scripts: {}, images }),
  buildPostPages({ styles, scripts: {}, images }),
]);
