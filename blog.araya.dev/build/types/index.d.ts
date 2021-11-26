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
  tags: string[];
  url: string;
  description?: string;
  ampUrl: string;
  canonicalUrl: string;
  changeLogs: Array<GitLog>;
};
type Posts = Post[];
