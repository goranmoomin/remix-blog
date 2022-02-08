import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";

import { fileTypeStream } from "file-type";

import parseFrontMatter from "front-matter";
import MarkdownIt from "markdown-it";
import { JSDOM } from "jsdom";
import { TeX } from "mathjax-full/js/input/tex";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import { SVG } from "mathjax-full/js/output/svg";
import { JsdomAdaptor } from "mathjax-full/js/adaptors/jsdomAdaptor";
import { HTMLHandler } from "mathjax-full/js/handlers/html/HTMLHandler";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml";
import hljs from "highlight.js";

let DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..");

let POST_DIR = path.join(DATA_DIR, "posts");
let IMAGE_DIR = path.join(DATA_DIR, "images");

let CATEGORY_TAGS = ["PS", "Dev", "PL", "TIL"];

let md = new MarkdownIt();

/**
 * @param {string} body
 * @returns {string}
 */
function renderBody(body) {
  // Hack to make mathjax escaping tolerable...
  // TODO: Implement a MarkdownIt plugin to only apply automatic escaping in Mathjax blocks.
  body = body.replaceAll("\\\\", "\\\\\\\\");
  body = body.replaceAll(/\\(!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|\[|]|\^|_|\`|{|\||}|~)/g, "\\\\$1");

  let html = md.render(body);

  let dom = new JSDOM(html);
  let document = dom.window.document;

  // Mathjax uses a global handler registry by default which is not optimal for our needs.
  // We use a handler directly based on JSDOM for easier DOM manipulation.
  let adaptor = new JsdomAdaptor(dom.window);
  let handler = new HTMLHandler(adaptor);
  AssistiveMmlHandler(handler);

  let mathJaxDocument = handler.create(dom.window.document, {
    InputJax: new TeX({
      packages: AllPackages,
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      processEscapes: true
    }),
    // FIXME: Investigate why using a global font cache makes pages load unreliably.
    OutputJax: new SVG({ fontCache: "local" })
  });

  mathJaxDocument.render();

  // If there are no math elements, remove leftover SVG-related data.
  if (Array.from(mathJaxDocument.math).length === 0) {
    document.getElementById(SVG.STYLESHEETID)?.remove();
    // We aren't using a global font cache, so this is a no-op.
    document.getElementById(SVG.FONTCACHEID)?.remove();
  }

  // Add tailwind classes to unstyled plain HTML tags.
  for (let mjxEl of document.querySelectorAll("mjx-container[jax='SVG']")) {
    if (mjxEl.getAttribute("display") === "true") {
      mjxEl.classList.add("block", "overflow-auto");
      mjxEl.querySelector("svg").classList.add("block", "mx-auto");
    } else {
      mjxEl.querySelector("svg").classList.add("inline");
    }
    mjxEl.querySelector("mjx-assistive-mml").classList.add("sr-only");
  }
  for (let codeEl of document.querySelectorAll("pre code")) {
    hljs.highlightElement(codeEl);
    codeEl.classList.add("text-sm", "px-4", "py-3", "lg:-mx-4", "rounded-xl");
  }
  for (let headingEl of document.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    let headingSize = Number.parseInt(headingEl.tagName.substring(1)) - 1;
    headingEl.classList.add(["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"][headingSize], "font-serif", "mt-6", "mb-2", "font-bold");
  }
  for (let listEl of document.querySelectorAll("ul, ol")) {
    let listType = listEl.tagName.toLowerCase();
    listEl.classList.add({ ul: "list-disc", ol: "list-decimal" }[listType], "list-inside");
  }
  for (let paragraphEl of document.querySelectorAll("p")) {
    paragraphEl.classList.add("my-2");
  }
  for (let blockquoteEl of document.querySelectorAll("blockquote")) {
    blockquoteEl.classList.add("pl-4", "my-4", "border-l-4", "border-l-indigo-700");
  }
  for (let anchorEl of document.querySelectorAll("a")) {
    anchorEl.classList.add("text-indigo-700", "underline", "decoration-2", "underline-offset-4");
  }
  for (let imageEl of document.querySelectorAll("img")) {
    imageEl.classList.add("my-4");
  }

  html = document.body.innerHTML;

  return html;
}

/**
 * @typedef {Object} PostAttributes
 * @property {string} title
 * @property {string} summary
 * @property {Date} date
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Post
 * @property {string} name
 * @property {string} title
 * @property {string} body
 * @property {string} summary
 * @property {Date} createdAt
 * @property {string[]} tagnames
 */

/**
 * @param {Object} filter
 * @param {string=} filter.tagname
 * @returns {Promise<Post[]>}
 */
export async function getPosts(filter = {}) {
  let filenames = await fs.readdir(POST_DIR);
  filenames = filenames.filter(filename => /^[a-zA-Z0-9-]+\.md$/.test(filename));
  /** @type {Post[]} */
  let posts = await Promise.all(filenames.map(async filename => {
    let name = /^(.*)\.md$/.exec(filename)[1];
    let filepath = path.join(POST_DIR, filename);
    let content = await fs.readFile(filepath, { encoding: "utf8" });
    /** @type {{ attributes: PostAttributes, body: string }} */
    let { attributes, body } = parseFrontMatter(content);
    if (typeof attributes.title !== "string" ||
        typeof attributes.summary !== "string" ||
        !(typeof attributes.date === "object" && attributes.date instanceof Date) ||
        !(Array.isArray(attributes.tags) && attributes.tags.every(tag => typeof tag === "string"))) {
      throw new Error(`Invalid attributes for post ${filename}.`);
    }
    return {
      name,
      title: attributes.title,
      body,
      summary: attributes.summary,
      createdAt: attributes.date,
      tagnames: attributes.tags
    };
  }));

  if (filter.tagname) {
    let filterTagname = filter.tagname.toLowerCase();
    posts = posts.filter(post => post.tagnames.some(tagname => tagname.toLowerCase() === filterTagname));
  }

  return posts;
}

/**
 * @param {string} name
 * @returns {Promise<Post & { html: string }>}
 */
export async function getPost(name) {
  // Only allow known names to prevent reading unwanted files.
  if (!/^[a-zA-Z0-9-]+$/.test(name)) { throw new Error(`Invalid post name ${name}.`); }
  let filename = `${name}.md`;
  let filepath = path.join(POST_DIR, filename);
  let content = await fs.readFile(filepath, { encoding: "utf8" });
  /** @type {{ attributes: PostAttributes, body: string }} */
  let { attributes, body } = parseFrontMatter(content);
  if (typeof attributes.title !== "string" ||
      typeof attributes.summary !== "string" ||
      !(typeof attributes.date === "object" && attributes.date instanceof Date) ||
      !(Array.isArray(attributes.tags) && attributes.tags.every(tag => typeof tag === "string"))) {
    throw new Error(`Invalid attributes for post ${filename}.`);
  }
  let html = renderBody(body);
  return {
    name,
    title: attributes.title,
    body,
    html,
    summary: attributes.summary,
    createdAt: attributes.date,
    tagnames: attributes.tags
  };
}

/**
 * @typedef {Object} Tag
 * @property {string} name
 * @property {boolean} isCategory
 */

/**
 * @param {string[]=} names
 * @returns {Promise<Tag[]>}
 */
export async function getTags(names = []) {
  // FIXME: Highly inefficient.
  let posts = await getPosts();
  let tagnames = Array.from(new Set(posts.flatMap(post => post.tagnames))).sort();
  /** @type {Tag[]} */
  let tags = tagnames.map(name => ({
    name,
    isCategory: CATEGORY_TAGS.includes(name)
  }));
  if (names.length > 0) {
    names = names.map(name => name.toLowerCase());
    tags = tags.filter(tag => names.includes(tag.name.toLowerCase()));
  }
  return tags;
}

/**
 * @param {string} name
 * @returns {Tag}
 */
export async function getTag(name) {
  // FIXME: Highly inefficient.
  let tags = await getTags([name]);
  if (tags.length == 0) {
    throw new Error(`Invalid tag ${name}.`);
  }
  return tags[0];
}

/**
 * @typedef {Object} Image
 * @property {string} name
 * @property {string} mime
 * @property {import("fs").ReadStream} stream
 */

/**
 * @param {string} name
 * @returns {Promise<Image>}
 */
export async function getImage(name) {
  // Only allow known names to prevent reading unwanted files.
  if (!/^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/.test(name)) { throw new Error(`Invalid image name ${name}.`); }
  let filepath = path.join(IMAGE_DIR, name);
  let stream = await fileTypeStream(createReadStream(filepath));
  if (!stream.fileType?.mime.startsWith("image/")) {
    throw new Error(`Invalid image ${name}.`);
  }
  return {
    name,
    mime: stream.fileType.mime,
    stream
  };
}
