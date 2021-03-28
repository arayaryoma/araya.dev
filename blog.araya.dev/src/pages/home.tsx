import { h } from "../../deps.ts";

export const meta = {
  title: "Posts | araya's reservoir",
  styles: ["index.css", "posts-list.css"],
};

type Props = {
  posts: Array<{
    title: string;
    date: string;
    url: string;
  }>;
};

export const Home = (props: Props) => {
  return (
    <main>
      <div className="container">
        <h1 className="index-page-title heading__lined">Posts</h1>
        <ul className="posts-list--list">
          {props.posts.map((post) => (
            <li className="posts-list--item" key={post.url}>
              <a href={post.url}>
                <article className="posts-list--item-content">
                  <img
                    src="/assets/images/default-thumbnail.svg"
                    alt="thumbnail"
                    className="posts-list--item-thumbnail"
                    loading="lazy"
                  />
                  <time className="posts-list--item-date" dateTime={post.date}>
                    {post.date}
                  </time>
                  <h2 className="posts-list--item-title">{post.title}</h2>
                </article>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};
