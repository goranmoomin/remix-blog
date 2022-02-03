import path from "path";
import fs from "fs/promises";
import { db } from "~/utils/db.server";
import parseFrontMatter from "front-matter";
import MarkdownIt from "markdown-it";
import { JSDOM } from "jsdom";
import { TeX } from "mathjax-full/js/input/tex";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import { SVG } from "mathjax-full/js/output/svg";
import { CHTML } from "mathjax-full/js/output/chtml";
import { JsdomAdaptor } from "mathjax-full/js/adaptors/jsdomAdaptor";
import { HTMLHandler } from "mathjax-full/js/handlers/html/HTMLHandler";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml";

import hljs from "highlight.js";

let md = new MarkdownIt();

function renderBody(body) {
  body = body.replaceAll("\\\\", "\\\\\\\\");
  body = body.replaceAll(/\\(!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|\[|]|\^|_|\`|{|\||}|~)/g, "\\\\$1");
  let html = md.render(body);
  let dom = new JSDOM(html);
  let document = dom.window.document;

  let adaptor = new JsdomAdaptor(dom.window);
  let handler = new HTMLHandler(adaptor);
  AssistiveMmlHandler(handler);
  let mathJaxDocument = handler.create(dom.window.document, {
    InputJax: new TeX({
      packages: AllPackages,
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      processEscapes: true
    }),
    OutputJax: new SVG({ fontCache: "local" })
  });
  mathJaxDocument.render();
  for (let mjxEl of document.querySelectorAll("mjx-container[jax='SVG']")) {
    if (mjxEl.getAttribute("display") === "true") {
      mjxEl.classList.add("block", "overflow-auto");
      mjxEl.querySelector("svg").classList.add("block", "mx-auto");
    } else {
      mjxEl.querySelector("svg").classList.add("inline");
    }
    mjxEl.querySelector("mjx-assistive-mml").classList.add("sr-only");
  }
  if (Array.from(mathJaxDocument.math).length === 0) {
    document.getElementById(SVG.STYLESHEETID).remove();
    // document.getElementById(SVG.FONTCACHEID).remove();
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


export async function getPosts(filter = {}) {
  let posts = await db.post.findMany({
    where: filter.tag ? {
      tags: {
        some: {
          name: filter.tag
        }
      }
    } : undefined
  });

  return posts;
}

export async function getPost(slug) {
  let post = await db.post.findUnique({
    where: {
      slug
    },
    include: {
      tags: true
    }
  });
  let html = renderBody(post.body);
  return {
    html,
    ...post
  };
}

export async function getTags() {
  return await db.tag.findMany();
}
