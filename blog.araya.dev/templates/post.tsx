// <title>{{ title }}</title>
// <link rel="stylesheet" href="/styles/markdown.css">
// <link rel="stylesheet" href="/styles/post.css">
// <link rel="stylesheet" href="/styles/lib/highlight.js/dracula.css">
// <script src="/js/highlight.js" defer></script>

import { React } from "../deps.ts";

export const Post = (props: any) => {
  return (
    <>
      <nav className="container">
        <ul className="post__breadcrumb">
          <li className="post__breadcrumb-item">
            <a href="/">投稿一覧</a>
          </li>
          <li className="post__breadcrumb-item">{props.title}</li>
        </ul>
      </nav>
      <article className="container post__container">
        <header className="post-header">
          <time className="post-header--datetime">{props.date}</time>
          <h1 className="post-header--title">{props.title}</h1>
        </header>
        <main className="post--main">
          <div className="post--content markdown">{props.children}</div>
        </main>
      </article>
    </>
  );
};
