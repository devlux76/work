import type { AppInterface } from './types.js';

// ── Shadow-scoped styles ─────────────────────────────────────────────────────
const STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; cursor: pointer; border: none; background: none; outline: none; }

:host { display: flex; align-items: stretch; height: 100%; padding: 0 4px; }

.menu-item { position: relative; display: flex; align-items: center; }

.menu-label {
  display: flex; align-items: center;
  padding: 0 10px; height: 100%;
  font-size: 13px; color: var(--text-primary, #0f172a);
  cursor: pointer; border-radius: var(--radius-sm, 4px);
  transition: background var(--transition-fast, 120ms ease);
  user-select: none;
}
.menu-item:hover .menu-label,
.menu-item.open  .menu-label { background: var(--bg-surface-3, #f1f5f9); }
.menu-item.open  .menu-label { background: var(--color-primary-light, #dbeafe); color: var(--color-primary, #2563eb); }

.menu-dropdown {
  display: none; position: absolute; top: 100%; left: 0;
  min-width: 220px;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 6px);
  box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);
  z-index: var(--z-dropdown, 100);
  padding: 4px;
  animation: dropdown-appear 120ms ease;
}
.menu-item.open .menu-dropdown { display: block; }

@keyframes dropdown-appear {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.menu-action {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 6px 12px; font-size: 13px;
  color: var(--text-primary, #0f172a); border-radius: var(--radius-sm, 4px);
  transition: background var(--transition-fast, 120ms ease); text-align: left;
}
.menu-action:hover { background: var(--color-primary-light, #dbeafe); color: var(--color-primary, #2563eb); }

.menu-shortcut {
  font-size: 11px; color: var(--text-muted, #94a3b8);
  margin-left: 24px; font-family: var(--font-mono, monospace);
}
.menu-sep { height: 1px; background: var(--border-color, #e2e8f0); margin: 4px 8px; }
`;

// ── Menu data ────────────────────────────────────────────────────────────────
type MenuSep  = { type: 'sep' };
type MenuItem = { label: string; action: string; shortcut?: string };
type MenuEntry = MenuSep | MenuItem;

interface MenuDef { label: string; items: MenuEntry[] }

const MENUS: MenuDef[] = [
  {
    label: 'File',
    items: [
      { label: 'New',              action: 'newDocument',      shortcut: 'Ctrl+N' },
      { label: 'Open...',          action: 'openDocumentDialog', shortcut: 'Ctrl+O' },
      { label: 'Save',             action: 'saveDocument',     shortcut: 'Ctrl+S' },
      { label: 'Save As...',       action: 'saveDocumentAs',   shortcut: 'Ctrl+Shift+S' },
      { type: 'sep' },
      { label: 'Import...',        action: 'importDocument' },
      { label: 'Export as Markdown', action: 'exportMarkdown' },
      { label: 'Export as PDF',    action: 'exportPDF' },
      { type: 'sep' },
      { label: 'Close',            action: 'closeDocument' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo',        action: 'editorUndo',    shortcut: 'Ctrl+Z' },
      { label: 'Redo',        action: 'editorRedo',    shortcut: 'Ctrl+Y' },
      { type: 'sep' },
      { label: 'Cut',         action: 'execCut',       shortcut: 'Ctrl+X' },
      { label: 'Copy',        action: 'execCopy',      shortcut: 'Ctrl+C' },
      { label: 'Paste',       action: 'execPaste',     shortcut: 'Ctrl+V' },
      { label: 'Select All',  action: 'execSelectAll', shortcut: 'Ctrl+A' },
      { type: 'sep' },
      { label: 'Find...',          action: 'showFind',        shortcut: 'Ctrl+F' },
      { label: 'Find & Replace...', action: 'showFindReplace', shortcut: 'Ctrl+H' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toggle Source', action: 'toggleEdit', shortcut: 'Ctrl+\\' },
      { label: 'Split View',    action: 'setSplit' },
      { label: 'Preview Only',  action: 'setPreview' },
      { type: 'sep' },
      { label: 'Zoom In',   action: 'zoomIn',   shortcut: 'Ctrl+=' },
      { label: 'Zoom Out',  action: 'zoomOut',  shortcut: 'Ctrl+-' },
      { label: 'Reset Zoom',action: 'zoomReset',shortcut: 'Ctrl+0' },
      { type: 'sep' },
      { label: 'Toggle Dark Mode', action: 'toggleDarkMode' },
      { label: 'Toggle Sidebar',   action: 'toggleSidebar' },
    ],
  },
  {
    label: 'Insert',
    items: [
      { label: 'Link',            action: 'insertLinkDialog',  shortcut: 'Ctrl+K' },
      { label: 'Image',           action: 'insertImageDialog' },
      { label: 'Table',           action: 'insertTableDialog' },
      { label: 'Code Block',      action: 'insertCodeBlock' },
      { label: 'Inline Math',     action: 'insertInlineMath' },
      { label: 'Math Block',      action: 'insertMathBlock',  shortcut: 'Ctrl+Shift+M' },
      { label: 'Mermaid Diagram', action: 'insertMermaidBlock' },
      { type: 'sep' },
      { label: 'Horizontal Rule', action: 'insertHR' },
      { label: 'Blockquote',      action: 'insertQuote' },
    ],
  },
  {
    label: 'Format',
    items: [
      { label: 'Bold',        action: 'bold',        shortcut: 'Ctrl+B' },
      { label: 'Italic',      action: 'italic',      shortcut: 'Ctrl+I' },
      { label: 'Underline',   action: 'underline',   shortcut: 'Ctrl+U' },
      { label: 'Strikethrough', action: 'strikethrough' },
      { type: 'sep' },
      { label: 'Code',        action: 'inlineCode' },
      { type: 'sep' },
      { label: 'Heading 1',   action: 'heading1' },
      { label: 'Heading 2',   action: 'heading2' },
      { label: 'Heading 3',   action: 'heading3' },
      { label: 'Heading 4',   action: 'heading4' },
      { label: 'Heading 5',   action: 'heading5' },
      { label: 'Heading 6',   action: 'heading6' },
      { type: 'sep' },
      { label: 'Blockquote',  action: 'insertQuote' },
      { type: 'sep' },
      { label: 'Clear Formatting', action: 'clearFormatting' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Word Count',        action: 'showWordCount' },
      { type: 'sep' },
      { label: 'Edit Document CSS', action: 'editDocumentCSS' },
      { type: 'sep' },
      { label: 'Settings',          action: 'showSettings' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Keyboard Shortcuts', action: 'showShortcuts' },
      { type: 'sep' },
      { label: 'About',              action: 'showAbout' },
    ],
  },
];

// ── DOM helpers ──────────────────────────────────────────────────────────────
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// ── MenuBar class ────────────────────────────────────────────────────────────
export class MenuBar {
  private readonly shadow: ShadowRoot;
  private readonly app: AppInterface;
  private activeItem: HTMLElement | null = null;

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

    for (const menu of MENUS) {
      const item = el('div', 'menu-item');
      item.dataset['menu'] = menu.label;

      // Label button
      const label = el('button', 'menu-label');
      label.textContent = menu.label;
      label.setAttribute('aria-haspopup', 'true');
      label.setAttribute('aria-expanded', 'false');

      // Dropdown
      const dropdown = el('div', 'menu-dropdown');
      dropdown.setAttribute('role', 'menu');

      for (const entry of menu.items) {
        if ('type' in entry) {
          dropdown.appendChild(el('div', 'menu-sep'));
        } else {
          const btn = el('button', 'menu-action');
          btn.dataset['action'] = entry.action;
          btn.setAttribute('role', 'menuitem');

          const labelSpan = el('span');
          labelSpan.textContent = entry.label;
          btn.appendChild(labelSpan);

          if (entry.shortcut) {
            const shortcutSpan = el('span', 'menu-shortcut');
            shortcutSpan.textContent = entry.shortcut;
            btn.appendChild(shortcutSpan);
          }

          dropdown.appendChild(btn);
        }
      }

      item.append(label, dropdown);
      frag.appendChild(item);
    }

    this.shadow.appendChild(frag);
  }

  private bindEvents(): void {
    // Delegated listener for the whole shadow root
    this.shadow.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const actionEl = target.closest('[data-action]') as HTMLElement | null;
      const menuItem = target.closest('.menu-item') as HTMLElement | null;

      const action = actionEl?.dataset['action'];
      if (action) {
        this.close();
        this.handleAction(action);
        return;
      }

      if (menuItem) {
        menuItem === this.activeItem ? this.close() : this.open(menuItem);
      }
    });

    // Hover-open when another menu is already open
    this.shadow.addEventListener('mouseenter', (e: Event) => {
      if (!this.activeItem) return;
      const menuItem = (e.target as HTMLElement).closest('.menu-item') as HTMLElement | null;
      if (menuItem && menuItem !== this.activeItem) this.open(menuItem);
    }, true);

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.shadow.host.contains(e.target as Node)) this.close();
    });
  }

  private open(item: HTMLElement): void {
    this.activeItem?.classList.remove('open');
    this.activeItem?.querySelector('.menu-label')?.setAttribute('aria-expanded', 'false');
    this.activeItem = item;
    item.classList.add('open');
    item.querySelector('.menu-label')?.setAttribute('aria-expanded', 'true');
  }

  private close(): void {
    this.activeItem?.classList.remove('open');
    this.activeItem?.querySelector('.menu-label')?.setAttribute('aria-expanded', 'false');
    this.activeItem = null;
  }

  private handleAction(action: string): void {
    const a = this.app;
    switch (action) {
      case 'newDocument':       a.newDocument();                           break;
      case 'openDocumentDialog':a.openDocumentDialog();                    break;
      case 'saveDocument':      a.saveDocument();                         break;
      case 'saveDocumentAs':    a.saveDocumentAs();                       break;
      case 'importDocument':    a.importDocument();                       break;
      case 'exportMarkdown':    a.exportMarkdown();                       break;
      case 'exportPDF':         a.exportPDF();                            break;
      case 'closeDocument':     a.closeDocument();                        break;
      case 'editorUndo':        a.editor?.undo();                         break;
      case 'editorRedo':        a.editor?.redo();                         break;
      case 'execCut': {
        const selection = window.getSelection();
        const text = selection?.toString() ?? '';

        // First, try the legacy cut command which both copies and deletes the selection.
        try {
          if (document.execCommand('cut')) {
            break;
          }
        } catch {
          // Ignore and fall through to Clipboard API fallback.
        }

        // Fallback: use the Clipboard API, then manually delete the selected content.
        if (!text || !navigator.clipboard || !navigator.clipboard.writeText) {
          break;
        }

        navigator.clipboard.writeText(text).then(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) return;

          if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
          } else if (typeof (sel as any).deleteFromDocument === 'function') {
            (sel as any).deleteFromDocument();
          }
        }).catch(() => {
          // If Clipboard API fails, there's nothing more we can do here.
        });
        break;
      }
      case 'execCopy':
        navigator.clipboard.writeText(window.getSelection()?.toString() ?? '')
          .catch(() => { document.execCommand('copy'); });
        break;
      case 'execPaste':
        navigator.clipboard.readText()
          .then(t => a.editor?.insertAtCursor(t))
          .catch(() => { document.execCommand('paste'); });
        break;
      case 'execSelectAll':     a.editor?.selectAll();                    break;
      case 'showFind':          a.showFind();                             break;
      case 'showFindReplace':   a.showFindReplace();                      break;
      case 'toggleEdit':        a.setMode(a.state.mode === 'edit' ? 'split' : 'edit'); break;
      case 'setSplit':          a.setMode('split');                       break;
      case 'setPreview':        a.setMode('preview');                     break;
      case 'zoomIn':            a.setZoom(a.state.zoom + 10);             break;
      case 'zoomOut':           a.setZoom(a.state.zoom - 10);             break;
      case 'zoomReset':         a.setZoom(100);                           break;
      case 'toggleDarkMode':    a.toggleDarkMode();                       break;
      case 'toggleSidebar':     a.toggleSidebar();                        break;
      case 'insertLinkDialog':  a.insertLinkDialog();                     break;
      case 'insertImageDialog': a.insertImageDialog();                    break;
      case 'insertTableDialog': a.insertTableDialog();                    break;
      case 'insertCodeBlock':   a.insertBlock('\n```\n\n```\n');          break;
      case 'insertInlineMath':  a.insertFormatting('$', '$');             break;
      case 'insertMathBlock':   a.insertBlock('\n$$\n\n$$\n');            break;
      case 'insertMermaidBlock':a.insertBlock('\n```mermaid\ngraph TD\n  A --> B\n```\n'); break;
      case 'insertHR':          a.insertBlock('\n---\n');                 break;
      case 'insertQuote':       a.insertBlock('> ');                      break;
      case 'bold':              a.insertFormatting('**', '**');           break;
      case 'italic':            a.insertFormatting('*', '*');             break;
      case 'underline':         a.insertFormatting('<u>', '</u>');        break;
      case 'strikethrough':     a.insertFormatting('~~', '~~');           break;
      case 'inlineCode':        a.insertFormatting('`', '`');             break;
      case 'heading1':          a.insertBlock('# ');                      break;
      case 'heading2':          a.insertBlock('## ');                     break;
      case 'heading3':          a.insertBlock('### ');                    break;
      case 'heading4':          a.insertBlock('#### ');                   break;
      case 'heading5':          a.insertBlock('##### ');                  break;
      case 'heading6':          a.insertBlock('###### ');                 break;
      case 'clearFormatting':   a.clearFormatting();                      break;
      case 'showWordCount':     a.showWordCount();                        break;
      case 'editDocumentCSS':   a.editDocumentCSS();                      break;
      case 'showSettings':      a.dialogs.showAboutDialog();              break;
      case 'showShortcuts':     a.dialogs.showKeyboardShortcutsDialog();  break;
      case 'showAbout':         a.dialogs.showAboutDialog();              break;
    }
  }
}
