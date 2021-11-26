export const meta = {
  title: "Posts | araya's reservoir",
  styles: ["index.css", "posts-list.css"],
};

type Props = {
  posts: Array<Post>;
};

const speculationRules = `{
  "prefetch_with_subresources": [
    {
      "source": "list",
      "urls": ["/posts/2021-07-25/speculation-rules.html"]
    }
  ]
}`;

export const Home = (props: Props) => {
  return (
    <>
      <main>
        <div className="container">
          <h1 className="index-page-title heading__lined">Posts</h1>
          <ul className="posts-list__root posts-list__list">
            {props.posts.map((post) => (
              <li className="posts-list__item" key={post.url}>
                <a href={post.url}>
                  <article className="posts-list-item__content">
                    <img
                      src="/assets/images/default-thumbnail.svg"
                      alt="thumbnail"
                      className="posts-list-item__thumbnail"
                      loading="lazy"
                    />
                    <time
                      className="posts-list-item__date"
                      dateTime={post.date}
                    >
                      {post.date}
                    </time>
                    <h2 className="posts-list-item__title">{post.title}</h2>
                    <p className="posts-list-item__description">
                      {post.description}
                    </p>
                  </article>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{ __html: speculationRules }}
      ></script>
    </>
  );
};
