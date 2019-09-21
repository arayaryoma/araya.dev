export type ParseFileNameResult = {
    date: string,
    fileName: string,
}
export type Post = {
    content: string,
    title: string,
    date: string,
    tags: string,
    url: string,
}
export type Posts = Post[]
