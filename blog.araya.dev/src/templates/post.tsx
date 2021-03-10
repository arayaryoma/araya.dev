import { React } from "../../deps.ts";
import { GitLog } from "../../build/types/index.d.ts";

const repo = "https://github.com/arayaryoma/araya.dev";

interface Props {
  changeLogs: GitLog[];
  title?: string;
  date?: string;
  children?: any;
}

export const Post = (props: Props) => {
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
          <div className="post--content markdown">
            {props.children}
            <details className="post__changelog">
              <summary>変更履歴</summary>
              {props.changeLogs &&
                props.changeLogs.map((history) => (
                  <p>
                    <a href={`${repo}/commit/${history.hash}`}>
                      <code>{history.hash.slice(0, 8)}</code>
                    </a>
                    <span className="post__changelog-message">
                      {history.message}
                    </span>
                  </p>
                ))}
            </details>
          </div>
        </main>
        <footer className="post__footer"></footer>
      </article>
    </>
  );
};
