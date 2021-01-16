import {
  copy,
  ensureDir,
  ensureFile,
} from "https://deno.land/std@0.83.0/fs/mod.ts";
import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { Post } from "./types/index.d.ts";
import React from "https://dev.jspm.io/react";
import ReactDOMServer from "https://dev.jspm.io/react-dom/server";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      button: any;
      div: any;
      h1: any;
      p: any;
    }
  }
}

const CWD = Deno.cwd();

const distDir = `${CWD}/dist`;

ensureDir(distDir);

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
  for await (const dirEntry of Deno.readDir(postsDir)) {
    const { date, fileName } = parseFileName(dirEntry.name);
    const file = await Deno.open(`${postsDir}/${dirEntry.name}`, {
      read: true,
    });
    const content = await Deno.readAll(file);
    Deno.close(file.rid);

    const parsed = Marked.parse(decoder.decode(content)).content;

    // const metadata = parser.getMetadata(true);
    // const { title, tags } = parseMetadata(metadata as string);
    const post: Post = {
      content: parsed,
      date,
      tags: "",
      title: "",
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
  for await (const dirEntry of Deno.readDir(stylesDir)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".css")) {
      await Deno.copyFile(
        `${stylesDir}/${dirEntry.name}`,
        `${distDir}/${dirEntry.name}`
      );
    }
  }
};

const copyAssets = async () => {
  const assetsDir = `${CWD}/assets`;
  for await (const dirEntry of Deno.readDir(assetsDir)) {
    await copy(`${assetsDir}/${dirEntry.name}`, `${distDir}/${dirEntry.name}`);
  }
};

const posts = await getPosts();
const encorder = new TextEncoder();
for (const post of posts) {
  const outputFilePath = `${distDir}/${post.url}`;
  await ensureFile(outputFilePath);
  await Deno.writeFile(outputFilePath, encorder.encode(post.content));
}

const str = (ReactDOMServer as any).renderToString(
  <div className="deno">land</div>
);
console.log(str);

await Promise.all([copyStylesheets(), copyAssets()]);
