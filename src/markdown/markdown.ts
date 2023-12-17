import hljs from "highlight.js";
// @ts-expect-error - no types
import generateTOC from "markdown-toc";
import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";

import sanitize from "./sanitize";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

marked.use(gfmHeadingId());

/**
 * Parses markdown into HTML and a table of contents.
 *
 * @param markdown The markdown to parse.
 * @returns The parsed HTML and table of contents.
 */
export default async function parseMarkdown(markdown: string) {
  const html = await marked.parse(markdown, {});
  const toc = getToc(markdown);

  return {
    html: sanitize(html),
    toc,
  };
}

function getToc(markdown: string): string {
  const toc = generateTOC(markdown).json as TOC;

  let html = "<nav><ol>";

  let currentLvl = 2;
  for (const { content, slug, lvl, i } of toc) {
    if (lvl === 1) continue;

    if (lvl > currentLvl) {
      html += "<ol>";
      currentLvl = lvl;
    } else if (lvl < currentLvl) {
      html += "</ol></li>".repeat(currentLvl - lvl);
      currentLvl = lvl;
    } else if (i > 1) {
      html += "</li>";
    }

    const isCode = content.match(/^`(.*)`$/);
    html += `<li><a href="#${slug}">${isCode ? `${isCode[1]}` : content}</a>`;
  }

  html += "</ol></nav>";
  return html;
}

type TOC = {
  content: string;
  slug: string;
  lvl: number;
  i: number;
  seen: number;
}[];
