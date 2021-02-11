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

const copyStylesheets = async () => {
  const stylesDir = `${CWD}/styles`;
  for await (const dirEntry of readDir(stylesDir)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".css")) {
      await copyFile(
        `${stylesDir}/${dirEntry.name}`,
        `${distDir}/${dirEntry.name}`
      );
    }
  }
};

const copyAssets = async () => {
  const assetsDir = `${CWD}/assets`;
  for (const file of await recursiveReaddir(assetsDir)) {
    const out = distDir + file.replace(CWD, "");
    await ensureFile(out);
    try {
      await copyFile(file, out);
    } catch (e) {
      console.error(e);
    }
  }
};

type StyleSheets = {
  main: string;
  index: string;
  markdown: string;
  post: string;
  "posts-list": string;
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

const buildPostPages = async ({ styles }: Subresources) => {
  const posts = await getPosts();
  const encorder = new TextEncoder();
  for (const post of posts) {
    const outputFilePath = `${distDir}/${post.url}`;
    await ensureFile(outputFilePath);
    const stylesheets: Array<StyleSheet> = [
      { href: `/${styles.main}`, rel: "prefetch" },
      { href: `/${styles.post}`, rel: "prefetch" },
      { href: `/${styles.markdown}`, rel: "prefetch" },
    ];
    const html = ReactDOMServer.renderToString(
      <Base styles={stylesheets}>
        <PostComponent title={post.title} date={post.date}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </PostComponent>
      </Base>
    );
    await writeFile(outputFilePath, encorder.encode(html));
  }
};

const styles = await buildStyleSheets();

await copyAssets();

await buildPostPages({ styles, scripts: {} });
