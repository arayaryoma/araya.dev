type ParseFileNameResult = {
  date: string;
  fileName: string;
};

interface GitLog {
  hash: string;
  date: string;
  message: string;
}

type Post = {
  content: string;
  title: string;
  date: string;
  tags: string;
  url: string;
  ampUrl: string;
  canonicalUrl: string;
  changeLogs: Array<GitLog>;
};
type Posts = Post[];

declare module "https://dev.jspm.io/react-dom/server" {
  const ReactDOMServer: {
    renderToString: (node: unknown) => string;
  };

  export default ReactDOMServer;
}
