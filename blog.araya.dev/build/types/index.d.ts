type ParseFileNameResult = {
  date: string;
  fileName: string;
};
type Post = {
  content: string;
  title: string;
  date: string;
  tags: string;
  url: string;
  ampUrl: string;
  canonicalUrl: string;
};
type Posts = Post[];
