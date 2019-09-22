type ParseFileNameResult = {
    date: string,
    fileName: string,
}
type Post = {
    content: string,
    title: string,
    date: string,
    tags: string,
    url: string,
}
type Posts = Post[]
