import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import katex from 'katex';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';

export function initMermaid(): void {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'strict',
  });
}

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch { /* fallback */ }
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

// Unique per-module token that cannot appear in user content, preventing placeholder
// collisions when users type text that looks like our marker.
// Falls back to Math.random-based hex for environments without crypto.randomUUID (non-secure contexts).
const RENDER_TOKEN = (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0')).join('-')
).replace(/-/g, '');
const BLOCK_PREFIX  = `MATHBLK_${RENDER_TOKEN}_`;
const INLINE_PREFIX = `MATHINL_${RENDER_TOKEN}_`;
const PLACEHOLDER_SUFFIX = '_END';

export async function renderMarkdown(content: string): Promise<string> {
  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  // Replace $$...$$ first (block math)
  let processed = content.replace(/\$\$([^$]+?)\$\$/gs, (_match, math: string) => {
    const idx = mathBlocks.length;
    mathBlocks.push(math);
    return `${BLOCK_PREFIX}${idx}${PLACEHOLDER_SUFFIX}`;
  });

  // Replace $...$ (inline math)
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_match, math: string) => {
    const idx = mathInlines.length;
    mathInlines.push(math);
    return `${INLINE_PREFIX}${idx}${PLACEHOLDER_SUFFIX}`;
  });

  // Replace mermaid code blocks before marked processes them
  processed = processed.replace(/```mermaid\n([\s\S]*?)```/g, (_match, code: string) => {
    return `<div class="mermaid">${code.trim()}</div>`;
  });

  // Run marked
  let html = await Promise.resolve(marked.parse(processed));

  // Build escaped-regex from prefix (safe since token contains only hex chars)
  const blockRe  = new RegExp(`${BLOCK_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`, 'g');
  const inlineRe = new RegExp(`${INLINE_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`, 'g');

  // Replace math placeholders — guard against out-of-range indices
  html = html.replace(blockRe, (match, idx: string) => {
    const math = mathBlocks[parseInt(idx, 10)];
    if (math === undefined) return match; // preserve original text if index is unexpected
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="math-block math-error">${math}</div>`;
    }
  });

  html = html.replace(inlineRe, (match, idx: string) => {
    const math = mathInlines[parseInt(idx, 10)];
    if (math === undefined) return match; // preserve original text if index is unexpected
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="math-error">${math}</span>`;
    }
  });

  // Sanitize
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ['math', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'mfrac', 'annotation', 'semantics', 'svg', 'path', 'use', 'defs', 'g'],
    ADD_ATTR: ['xmlns', 'mathvariant', 'display', 'aria-hidden', 'focusable', 'aria-labelledby', 'class', 'style', 'viewBox', 'd', 'fill', 'stroke', 'xlink:href', 'href'],
    FORCE_BODY: false,
    WHOLE_DOCUMENT: false,
  });

  return clean;
}

export async function runMermaid(): Promise<void> {
  try {
    await mermaid.run();
  } catch { /* ignore mermaid errors */ }
}
