import { createElement } from "react";
import { renderToString } from "react-dom/server";
import puppeteer from "puppeteer";

import { Root } from "./template";
import { writeFile } from "../io";

const el = createElement(Root, { title: "Hello World" });

const html = renderToString(el);

type State = {
  page: puppeteer.Page | null;
  browser: puppeteer.Browser | null;
};

const state: State = {
  page: null,
  browser: null,
};

(async () => {
  const ss = await getScreenshot(html);
  await writeFile("./sample.webp", ss);
  await state.browser?.close();
})().then(() => {
  process.exit(0);
});

async function getPage(): Promise<State["page"]> {
  if (state.page !== null) {
    return state.page;
  }
  const browser = await puppeteer.launch();
  state.page = await browser.newPage();
  return state.page;
}

export async function getScreenshot(html: string): Promise<Buffer> {
  const page = await getPage();
  if (page === null) {
    throw new Error("Page is null");
  }
  await page.setViewport({ width: 2048, height: 1170 });
  await page.setContent(html);
  const file = await page.screenshot({ type: "webp", encoding: "binary" });
  if (typeof file === "string") {
    throw new Error("File is not a buffer");
  }
  return file;
}
