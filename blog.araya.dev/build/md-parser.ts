import remark from "remark";
import html from "remark-html";
import frontmatter from "remark-frontmatter";
import extractFrontmatter from "remark-extract-frontmatter";
import yaml from "yaml";

const parser = remark()
  .use(frontmatter, [{ type: "yaml", marker: "-" }])
  .use(extractFrontmatter, { yaml: yaml.parse })
  .use(html);

export const mdToHtml = async (
  mdContent: string
): Promise<{ content: string; title: string; tags: string[] }> => {
  return new Promise((resolve, reject) => {
    parser.process(mdContent, (err, file) => {
      const data: any = file.data;
      resolve({ content: file.toString(), title: data.title, tags: data.tags });
    });
  });
};

function logger(): any {
  return console.dir;
}
