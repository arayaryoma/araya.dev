import * as fs from "fs";
import * as path from "path";

import { Feed } from "feed";
import { Author, FeedOptions } from "feed/lib/typings";
const fsPromises = fs.promises;
const author: Author = {
  name: "Araya",
  email: "r1o.ryoma.abe@gmail.com"
};
const feedOptions: FeedOptions = {
  author,
  copyright: "Araya",
  generator: "null",
  id: "blog.araya.dev",
  language: "ja",
  link: "https://blog.araya.dev",
  title: "blog.araya.dev"
};
export const generateFeed = async (posts: Posts): Promise<void> => {
  const feed = new Feed(feedOptions);
  posts.sort((a, b) => a.date > b.date ? -1 : 1);
  posts.slice(0, 10).forEach(post => {
    feed.addItem({
      author: [author],
      content: post.content,
      copyright: feedOptions.copyright,
      date: new Date(post.date),
      description: "",
      image: "",
      link: `https://blog.araya.dev/${post.url}`,
      title: post.title
    });
  });
  await fsPromises.writeFile(
    path.resolve(__dirname, "../dist/feed.xml"),
    feed.atom1()
  );
};
