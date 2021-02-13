import { Feed } from "https://cdn.skypack.dev/feed";
import { writeFile } from "./io.ts";

type Author = {
  name: string;
  email: string;
};

type FeedOptions = {
  author: Author;
  copyright: string;
  generator: string;
  id: string;
  language: string;
  link: string;
  title: string;
};

const author: Author = {
  name: "araya",
  email: "araya@araya.dev",
};

const feedOptions: FeedOptions = {
  author,
  copyright: "araya",
  generator: "null",
  id: "blog.araya.dev",
  language: "ja",
  link: "https://blog.araya.dev",
  title: "blog.araya.dev",
};

export const generateFeed = async (
  posts: Posts,
  distDir: string
): Promise<void> => {
  const encorder = new TextEncoder();
  const feed = new Feed(feedOptions);
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  posts.slice(0, 10).forEach((post) => {
    feed.addItem({
      author: [author],
      content: post.content,
      copyright: feedOptions.copyright,
      date: new Date(post.date),
      description: "",
      image: "",
      link: `https://blog.araya.dev/${post.url}`,
      title: post.title,
    });
  });
  return await writeFile(`${distDir}/feed.xml`, encorder.encode(feed.atom1()));
};
