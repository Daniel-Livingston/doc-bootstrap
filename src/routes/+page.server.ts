import type { PageServerLoad } from './$types';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import hljs from 'highlight.js';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { markedHighlight } from 'marked-highlight';
// @ts-expect-error - no types
import generateTOC from 'markdown-toc';
import markdown from './example.md?raw';

const marked = new Marked(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);
marked.use(gfmHeadingId());
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;

export const load: PageServerLoad = async () => {
	const content = sanitize(await marked.parse(markdown));
	const toc = generateTOC(markdown).json as TOCJson;

	return {
		content: content,
		toc: parseTOCJson(toc)
	};
};

function parseTOCJson(toc: TOCJson): string {
	let html = '<nav><ol>';

	let currentLvl = 2;
	for (const { content, slug, lvl, i } of toc) {
		if (lvl === 1) continue;

		if (lvl > currentLvl) {
			html += '<ol>';
			currentLvl = lvl;
		} else if (lvl < currentLvl) {
			html += '</ol></li>'.repeat(currentLvl - lvl);
			currentLvl = lvl;
		} else if (i > 1) {
			html += '</li>';
		}

		const isCode = content.match(/^`(.*)`$/);
		html += `<li><a href="#${slug}">${isCode ? `<code>${isCode[1]}</code>` : content}</a>`;
	}

	html += '</ol></nav>';
	return html;
}

type TOCJson = {
	content: string;
	slug: string;
	lvl: number;
	i: number;
	seen: number;
}[];
