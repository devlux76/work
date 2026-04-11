import type { AppInterface } from './types.js';

// ── SVG icon strings (static, compile-time constants) ───────────────────────
const IC = {
  file:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  folder:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  save:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  dl:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  print:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  undo:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.75"/></svg>`,
  redo:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.75"/></svg>`,
  pencil:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  split:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
  eye:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  bold:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>`,
  italic:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>`,
  ul:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>`,
  strike:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 5.5C16.5 4 14.9 3 12.8 3c-3.3 0-5.3 2-5.3 4.2 0 1 .3 1.8.8 2.4"/><path d="M6.5 18.5C7.5 20 9.1 21 11.2 21c3.3 0 5.3-2 5.3-4.2 0-1-.3-1.8-.8-2.4"/></svg>`,
  code:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  blist:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>`,
  olist:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`,
  check:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  link:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  img:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  table:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  math:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="8" y2="6"/><line x1="4" y1="18" x2="8" y2="18"/></svg>`,
  diagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>`,
  hr:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  quote:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
  zoomOut: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  zoomIn:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  chevron: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
} as const;

// ── Shadow-scoped styles ─────────────────────────────────────────────────────
const STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; cursor: pointer; border: none; background: none; outline: none; }

:host {
  display: flex;
  align-items: stretch;
  height: 100%;
  overflow-x: auto;
  overflow-y: visible;
}
:host::-webkit-scrollbar { height: 3px; }
:host::-webkit-scrollbar-thumb { background: var(--border-color-2, #cbd5e1); border-radius: 2px; }

.toolbar-inner {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 2px;
  min-width: max-content;
}
.toolbar-group { display: flex; align-items: center; gap: 1px; }
.toolbar-sep { width: 1px; height: 22px; background: var(--border-color, #e2e8f0); margin: 0 4px; flex-shrink: 0; }

.tb-btn {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  height: 30px; min-width: 30px; padding: 0 6px;
  border-radius: var(--radius-sm, 4px);
  color: var(--text-secondary, #475569);
  font-size: 12px; font-weight: 500;
  transition: background var(--transition-fast, 120ms ease), color var(--transition-fast, 120ms ease);
  white-space: nowrap;
}
.tb-btn:hover { background: var(--bg-surface-3, #f1f5f9); color: var(--text-primary, #0f172a); }
.tb-btn.active { background: var(--color-primary-light, #dbeafe); color: var(--color-primary, #2563eb); }
.tb-btn svg { flex-shrink: 0; }

.tb-dropdown-wrap { position: relative; }
.tb-dropdown-btn { gap: 3px; }

/* position:fixed escapes the host's overflow:hidden so the dropdown shows */
.tb-dropdown {
  position: fixed;
  min-width: 160px;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 6px);
  box-shadow: 0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
  z-index: 9999;
  padding: 4px;
  display: none;
  animation: dropdown-appear 120ms ease;
}
.tb-dropdown.open { display: block; }
.tb-dropdown button {
  display: block; width: 100%; padding: 6px 12px; font-size: 13px;
  color: var(--text-primary, #0f172a); text-align: left;
  border-radius: var(--radius-sm, 4px);
  transition: background var(--transition-fast, 120ms ease);
}
.tb-dropdown button:hover { background: var(--color-primary-light, #dbeafe); color: var(--color-primary, #2563eb); }

@keyframes dropdown-appear {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ── DOM helpers ──────────────────────────────────────────────────────────────
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Create a <button class="tb-btn"> with an SVG icon and optional text label. */
function makeBtn(action: string, title: string, icon: string, label?: string, extraClass?: string): HTMLButtonElement {
  const btn = el('button', 'tb-btn' + (extraClass ? ` ${extraClass}` : ''));
  btn.dataset['action'] = action;
  btn.title = title;
  // Parse static SVG via template so it becomes real DOM nodes (no innerHTML on btn itself)
  const tmpl = el('template');
  tmpl.innerHTML = icon;
  btn.appendChild(tmpl.content.cloneNode(true));
  if (label) {
    const span = el('span');
    span.textContent = label;
    btn.appendChild(span);
  }
  return btn;
}

function sep(): HTMLElement { return el('div', 'toolbar-sep'); }

function group(...children: HTMLElement[]): HTMLDivElement {
  const g = el('div', 'toolbar-group');
  g.append(...children);
  return g;
}

// ── Toolbar class ────────────────────────────────────────────────────────────
export class Toolbar {
  private readonly shadow: ShadowRoot;
  private readonly app: AppInterface;

  constructor(host: HTMLElement, app: AppInterface) {
    this.app = app;
    this.shadow = host.attachShadow({ mode: 'open' });

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    this.shadow.adoptedStyleSheets = [sheet];

    this.render();
    this.bindEvents();
  }

  private render(): void {
    const frag = document.createDocumentFragment();
    const inner = el('div', 'toolbar-inner');

    // ── Group 1: File operations
    inner.append(
      group(
        makeBtn('newDocument',    'New (Ctrl+N)',           IC.file),
        makeBtn('openDocument',   'Open (Ctrl+O)',          IC.folder),
        makeBtn('saveDocument',   'Save (Ctrl+S)',          IC.save),
        makeBtn('exportMarkdown', 'Export Markdown',        IC.dl),
        makeBtn('exportPDF',      'Print / Export PDF',     IC.print),
      ),
      sep(),
      // ── Group 2: Undo / Redo
      group(
        makeBtn('undo', 'Undo (Ctrl+Z)', IC.undo),
        makeBtn('redo', 'Redo (Ctrl+Y)', IC.redo),
      ),
      sep(),
      // ── Group 3: View mode
      group(
        makeBtn('setModeEdit',    'Edit Mode',  IC.pencil, 'Edit',    'mode-btn'),
        makeBtn('setModeSplit',   'Split View', IC.split,  'Split',   'mode-btn active'),
        makeBtn('setModePreview', 'Preview',    IC.eye,    'Preview', 'mode-btn'),
      ),
      sep(),
      // ── Group 4: Inline formatting
      group(
        makeBtn('bold',        'Bold (Ctrl+B)',       IC.bold),
        makeBtn('italic',      'Italic (Ctrl+I)',     IC.italic),
        makeBtn('underline',   'Underline (Ctrl+U)',  IC.ul),
        makeBtn('strikethrough','Strikethrough',      IC.strike),
        makeBtn('inlineCode',  'Inline Code',         IC.code),
      ),
      sep(),
      // ── Group 5: Headings dropdown
      group(this.makeHeadingsDropdown()),
      sep(),
      // ── Group 6: Lists
      group(
        makeBtn('bulletList',   'Bullet List',   IC.blist),
        makeBtn('numberedList', 'Numbered List', IC.olist),
        makeBtn('taskList',     'Task List',     IC.check),
      ),
      sep(),
      // ── Group 7: Insert
      group(
        makeBtn('insertLink',      'Link (Ctrl+K)',    IC.link),
        makeBtn('insertImage',     'Image',            IC.img),
        makeBtn('insertTable',     'Table',            IC.table),
        makeBtn('insertCodeBlock', 'Code Block',       IC.code),
        makeBtn('insertMath',      'Math Block',       IC.math),
        makeBtn('insertMermaid',   'Mermaid Diagram',  IC.diagram),
        makeBtn('insertHR',        'Horizontal Rule',  IC.hr),
        makeBtn('insertQuote',     'Blockquote',       IC.quote),
      ),
      sep(),
      // ── Group 8: Zoom
      group(
        makeBtn('zoomOut', 'Zoom Out (Ctrl+-)',  IC.zoomOut),
        makeBtn('zoomIn',  'Zoom In (Ctrl+=)',   IC.zoomIn),
      ),
    );

    frag.appendChild(inner);
    this.shadow.appendChild(frag);
  }

  private makeHeadingsDropdown(): HTMLElement {
    const wrap = el('div', 'tb-dropdown-wrap');

    // Build the heading selector button directly — no placeholder icon replaced after the fact
    const btn = el('button', 'tb-btn tb-dropdown-btn');
    btn.title = 'Headings';

    const headingsIconTmpl = el('template');
    headingsIconTmpl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    btn.appendChild(headingsIconTmpl.content.cloneNode(true));

    const labelSpan = el('span');
    labelSpan.textContent = 'H';
    btn.appendChild(labelSpan);

    const chevTmpl = el('template');
    chevTmpl.innerHTML = IC.chevron;
    btn.appendChild(chevTmpl.content.cloneNode(true));

    const dropdown = el('div', 'tb-dropdown');
    const headingItems: Array<[string, string]> = [
      ['heading1', 'H1 Heading 1'],
      ['heading2', 'H2 Heading 2'],
      ['heading3', 'H3 Heading 3'],
      ['heading4', 'H4 Heading 4'],
      ['heading5', 'H5 Heading 5'],
      ['heading6', 'H6 Heading 6'],
    ];
    for (const [action, text] of headingItems) {
      const item = el('button');
      item.dataset['action'] = action;
      item.textContent = text;
      dropdown.appendChild(item);
    }

    wrap.append(btn, dropdown);
    return wrap;
  }

  private bindEvents(): void {
    // Single delegated click listener on the shadow root
    this.shadow.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const dropBtn = target.closest('.tb-dropdown-btn') as HTMLElement | null;
      const actionEl = target.closest('[data-action]') as HTMLElement | null;

      if (dropBtn) {
        e.stopPropagation();
        const wrap = dropBtn.closest('.tb-dropdown-wrap');
        const dropdown = wrap?.querySelector('.tb-dropdown') as HTMLElement | null;
        if (dropdown) {
          const isOpen = dropdown.classList.contains('open');
          this.closeDropdowns();
          if (!isOpen) {
            // Position using fixed coords so it escapes overflow:hidden on host
            const rect = dropBtn.getBoundingClientRect();
            dropdown.style.top  = `${rect.bottom + 2}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.classList.add('open');
          }
        }
        return;
      }

      // Close dropdowns when any action fires
      this.closeDropdowns();

      if (!actionEl) return;
      const action = actionEl.dataset['action'];
      if (!action) return;
      this.handleAction(action);
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => this.closeDropdowns());
  }

  private closeDropdowns(): void {
    this.shadow.querySelectorAll('.tb-dropdown.open').forEach(d => d.classList.remove('open'));
  }

  private handleAction(action: string): void {
    const a = this.app;
    switch (action) {
      case 'newDocument':    a.newDocument();                           break;
      case 'openDocument':   a.openDocumentDialog();                    break;
      case 'saveDocument':   a.saveDocument();                         break;
      case 'exportMarkdown': a.exportMarkdown();                       break;
      case 'exportPDF':      a.exportPDF();                            break;
      case 'undo':           a.editor?.undo();                         break;
      case 'redo':           a.editor?.redo();                         break;
      case 'setModeEdit':    a.setMode('edit');                        break;
      case 'setModeSplit':   a.setMode('split');                       break;
      case 'setModePreview': a.setMode('preview');                     break;
      case 'bold':           a.insertFormatting('**', '**');           break;
      case 'italic':         a.insertFormatting('*', '*');             break;
      case 'underline':      a.insertFormatting('<u>', '</u>');        break;
      case 'strikethrough':  a.insertFormatting('~~', '~~');           break;
      case 'inlineCode':     a.insertFormatting('`', '`');             break;
      case 'heading1':       a.insertBlock('# ');                      break;
      case 'heading2':       a.insertBlock('## ');                     break;
      case 'heading3':       a.insertBlock('### ');                    break;
      case 'heading4':       a.insertBlock('#### ');                   break;
      case 'heading5':       a.insertBlock('##### ');                  break;
      case 'heading6':       a.insertBlock('###### ');                 break;
      case 'bulletList':     a.insertBlock('- ');                      break;
      case 'numberedList':   a.insertBlock('1. ');                     break;
      case 'taskList':       a.insertBlock('- [ ] ');                  break;
      case 'insertLink':     a.insertLinkDialog();                     break;
      case 'insertImage':    a.insertImageDialog();                    break;
      case 'insertTable':    a.insertTableDialog();                    break;
      case 'insertCodeBlock':a.insertBlock('\n```\n\n```\n');          break;
      case 'insertMath':     a.insertBlock('\n$$\n\n$$\n');            break;
      case 'insertMermaid':  a.insertBlock('\n```mermaid\ngraph TD\n  A --> B\n```\n'); break;
      case 'insertHR':       a.insertBlock('\n---\n');                 break;
      case 'insertQuote':    a.insertBlock('> ');                      break;
      case 'zoomIn':         a.setZoom(a.state.zoom + 10);             break;
      case 'zoomOut':        a.setZoom(a.state.zoom - 10);             break;
    }
  }

  /** Update active state on mode buttons. */
  setMode(mode: 'edit' | 'preview' | 'split'): void {
    this.shadow.querySelectorAll('.mode-btn').forEach(btn => {
      const b = btn as HTMLElement;
      const isActive =
        (b.dataset['action'] === 'setModeEdit'    && mode === 'edit')    ||
        (b.dataset['action'] === 'setModeSplit'   && mode === 'split')   ||
        (b.dataset['action'] === 'setModePreview' && mode === 'preview');
      b.classList.toggle('active', isActive);
    });
  }

  setDirty(_dirty: boolean): void { /* reserved for future indicator */ }
}
