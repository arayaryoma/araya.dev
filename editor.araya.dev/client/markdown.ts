import DOMPurify from "dompurify";
import { marked } from "marked";

marked.use({ gfm: true, breaks: false });

export interface RenderOptions {
  /** Origin the published blog serves root-relative assets from. */
  blogOrigin: string;
  /**
   * Images uploaded in this editing session, keyed by the repo-relative URL
   * that was inserted into the markdown. They are committed but not deployed
   * yet, so the blog would 404 them; the local object URL renders instead.
   */
  localImages: Map<string, string>;
}

export function renderMarkdown(
  source: string,
  options: RenderOptions,
): DocumentFragment {
  const html = marked.parse(source, { async: false }) as string;
  const fragment = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ADD_ATTR: ["target"],
  }) as unknown as DocumentFragment;

  for (const image of fragment.querySelectorAll("img")) {
    const src = image.getAttribute("src");
    if (src === null || !src.startsWith("/")) continue;
    image.setAttribute(
      "src",
      options.localImages.get(src) ?? options.blogOrigin + src,
    );
    image.loading = "lazy";
  }
  for (const link of fragment.querySelectorAll("a[href]")) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer noopener");
  }
  return fragment;
}
