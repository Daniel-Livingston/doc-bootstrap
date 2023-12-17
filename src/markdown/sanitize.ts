import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const { sanitize } = DOMPurify;

export default function (html: string): string {
  return sanitize(html);
}
