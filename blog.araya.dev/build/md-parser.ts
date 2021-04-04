import remark from "remark";
import html from "remark-html";
import frontmatter from "remark-frontmatter";
import { promisify } from "util";

const parser = remark()
  .use(html)
  .use(frontmatter, [{ type: "yaml", marker: "-" }]);

export const mdToHtml = async (mdContent: string): Promise<string> => {
  const file = await parser.process(mdContent);
  return String(file);
};
