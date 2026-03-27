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

export async function renderMarkdown(content: string): Promise<string> {
  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  // Replace $$...$$ first (block math)
  let processed = content.replace(/\$\$([^$]+?)\$\$/gs, (_match, math: string) => {
    const idx = mathBlocks.length;
    mathBlocks.push(math);
    return `MATHBLOCK_PLACEHOLDER_${idx}_END`;
  });

  // Replace $...$ (inline math)
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_match, math: string) => {
    const idx = mathInlines.length;
    mathInlines.push(math);
    return `MATHINLINE_PLACEHOLDER_${idx}_END`;
  });

  // Replace mermaid code blocks before marked processes them
  processed = processed.replace(/```mermaid\n([\s\S]*?)```/g, (_match, code: string) => {
    return `<div class="mermaid">${code.trim()}</div>`;
  });

  // Run marked
  let html = await Promise.resolve(marked.parse(processed));

  // Replace math placeholders
  html = html.replace(/MATHBLOCK_PLACEHOLDER_(\d+)_END/g, (_match, idx: string) => {
    const math = mathBlocks[parseInt(idx)];
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="math-block math-error">${math}</div>`;
    }
  });

  html = html.replace(/MATHINLINE_PLACEHOLDER_(\d+)_END/g, (_match, idx: string) => {
    const math = mathInlines[parseInt(idx)];
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
