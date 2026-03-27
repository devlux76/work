import { StorageManager } from './storage.js';
import { Editor } from './editor.js';
import { Toolbar } from './toolbar.js';
import { MenuBar } from './menu.js';
import { ShortcutManager } from './shortcuts.js';
import { DialogManager } from './dialogs.js';
import { renderMarkdown, initMermaid, runMermaid } from './renderer.js';
import type { AppState, AppInterface, Document } from './types.js';

class App implements AppInterface {
  state: AppState = {
    currentDocId: null,
    mode: 'split',
    isDirty: false,
    zoom: 100,
  };

  storage: StorageManager;
  editor: Editor | null = null;
  toolbar: Toolbar | null = null;
  menuBar: MenuBar | null = null;
  shortcuts: ShortcutManager;
  dialogs: DialogManager;

  private renderTimeout: ReturnType<typeof setTimeout> | null = null;
  private sidebarVisible = true;
  private isDarkMode = false;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private currentDoc: Document | null = null;

  constructor() {
    this.storage = new StorageManager();
    this.dialogs = new DialogManager();
    this.shortcuts = new ShortcutManager(this);
  }

  async init(): Promise<void> {
    await this.storage.init();
    initMermaid();
    this.createUI();
    await this.refreshDocumentList();
    const lastId = localStorage.getItem('lastDocId');
    if (lastId) {
      await this.openDocument(lastId).catch(() => this.showWelcome());
    } else {
      this.showWelcome();
    }
    this.setupAutoSave();

    if (localStorage.getItem('darkMode') === 'true') {
      this.toggleDarkMode();
    }

    document.getElementById('sidebar-toggle')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('darkmode-toggle')?.addEventListener('click', () => this.toggleDarkMode());
    document.getElementById('new-doc-btn')?.addEventListener('click', () => this.newDocument());
  }

  private createUI(): void {
    const toolbarEl = document.getElementById('toolbar')!;
    const menubarEl = document.getElementById('menubar')!;
    const editorContainer = document.getElementById('editor-container')!;

    this.menuBar = new MenuBar(menubarEl, this);
    this.toolbar = new Toolbar(toolbarEl, this);
    this.editor = new Editor(editorContainer, '', this.isDarkMode);

    this.editor.onChange = (content: string) => {
      this.state.isDirty = true;
      if (this.currentDoc) this.currentDoc.content = content;
      this.toolbar?.setDirty(true);
      const indicator = document.getElementById('dirty-indicator');
      if (indicator) indicator.style.display = 'inline';
      this.scheduleRender();
      this.updateStatusBar();
    };

    const divider = document.getElementById('pane-divider')!;
    let isResizing = false;
    divider.addEventListener('mousedown', () => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isResizing) return;
      const workspace = document.getElementById('workspace')!;
      const rect = workspace.getBoundingClientRect();
      const pct = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 20), 80);
      const editorPane = document.getElementById('editor-pane')!;
      const previewPane = document.getElementById('preview-pane')!;
      editorPane.style.flexBasis = `${pct}%`;
      previewPane.style.flexBasis = `${100 - pct}%`;
    });
    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    const sidebarResizer = document.getElementById('sidebar-resizer')!;
    let isSidebarResizing = false;
    sidebarResizer.addEventListener('mousedown', () => { isSidebarResizing = true; });
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isSidebarResizing) return;
      const mainContainer = document.getElementById('main-container')!;
      const rect = mainContainer.getBoundingClientRect();
      const width = Math.min(Math.max(e.clientX - rect.left, 150), 400);
      const sidebar = document.getElementById('sidebar')!;
      sidebar.style.width = `${width}px`;
    });
    document.addEventListener('mouseup', () => { isSidebarResizing = false; });
  }

  private scheduleRender(): void {
    if (this.renderTimeout) clearTimeout(this.renderTimeout);
    this.renderTimeout = setTimeout(() => this.updatePreview(), 300);
  }

  async updatePreview(): Promise<void> {
    const previewContent = document.getElementById('preview-content')!;
    if (!this.currentDoc) return;
    try {
      const html = await renderMarkdown(this.currentDoc.content);
      previewContent.innerHTML = html;
      this.applyCustomCSS();
      previewContent.style.fontSize = `${16 * this.state.zoom / 100}px`;
      await runMermaid();
    } catch (err) {
      console.error('Render error:', err);
    }
  }

  private applyCustomCSS(): void {
    let styleEl = document.getElementById('doc-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'doc-custom-css';
      document.head.appendChild(styleEl);
    }
    // Scope overrides under #preview-content so they never bleed into app chrome.
    // CSS nesting (supported in all modern browsers) lets users write full rule blocks.
    const cssOverrides = this.currentDoc?.cssOverrides?.trim();
    styleEl.textContent = cssOverrides ? `#preview-content { ${cssOverrides} }` : '';
  }

  async newDocument(): Promise<void> {
    const name = await this.dialogs.showNewDocumentDialog();
    if (!name) return;
    const doc: Document = {
      id: crypto.randomUUID(),
      name,
      content: `# ${name}\n\nStart writing here...\n`,
      created: Date.now(),
      modified: Date.now(),
    };
    await this.storage.saveDocument(doc);
    await this.openDocument(doc.id);
    await this.refreshDocumentList();
  }

  async openDocument(id: string): Promise<void> {
    if (this.state.isDirty && this.currentDoc) {
      const save = await this.dialogs.showConfirmDialog('Save changes before opening?', 'Unsaved Changes');
      if (save) await this.saveDocument();
      if (!save) return;
    }
    const doc = await this.storage.getDocument(id);
    if (!doc) throw new Error(`Document ${id} not found`);
    this.currentDoc = doc;
    this.state.currentDocId = id;
    this.state.isDirty = false;
    localStorage.setItem('lastDocId', id);

    this.editor?.setValue(doc.content);
    await this.updatePreview();

    const editorPane = document.getElementById('editor-pane')!;
    const previewPane = document.getElementById('preview-pane')!;
    editorPane.style.display = '';
    previewPane.style.display = '';
    this.setMode(this.state.mode);

    const titleEl = document.getElementById('doc-title');
    if (titleEl) titleEl.textContent = doc.name;
    const dirtyEl = document.getElementById('dirty-indicator');
    if (dirtyEl) dirtyEl.style.display = 'none';

    document.querySelectorAll('.doc-list-item').forEach(el => {
      (el as HTMLElement).classList.toggle('active', (el as HTMLElement).dataset['id'] === id);
    });

    this.updateStatusBar();
    this.editor?.focus();
  }

  async openDocumentDialog(): Promise<void> {
    const docs = await this.storage.listDocuments();
    const id = await this.dialogs.showOpenDocumentDialog(docs);
    if (id) await this.openDocument(id);
  }

  async saveDocument(): Promise<void> {
    if (!this.currentDoc) return;
    this.currentDoc.content = this.editor?.getValue() ?? this.currentDoc.content;
    await this.storage.saveDocument(this.currentDoc);
    this.state.isDirty = false;
    const dirtyEl = document.getElementById('dirty-indicator');
    if (dirtyEl) dirtyEl.style.display = 'none';
    await this.refreshDocumentList();
    this.showSaveIndicator();
  }

  private showSaveIndicator(): void {
    const indicator = document.getElementById('status-mode')!;
    const prev = indicator.textContent;
    indicator.textContent = '✓ Saved';
    setTimeout(() => { indicator.textContent = prev; }, 2000);
  }

  async saveDocumentAs(): Promise<void> {
    if (!this.currentDoc) return;
    const name = await this.dialogs.showNewDocumentDialog();
    if (!name) return;
    this.currentDoc.name = name;
    const titleEl = document.getElementById('doc-title');
    if (titleEl) titleEl.textContent = name;
    await this.saveDocument();
    await this.refreshDocumentList();
  }

  async importDocument(): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.markdown';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const doc = await this.storage.importFile(file);
      await this.openDocument(doc.id);
      await this.refreshDocumentList();
    };
    input.click();
  }

  exportMarkdown(): void {
    if (!this.currentDoc) return;
    this.storage.exportDocument(this.currentDoc);
  }

  exportPDF(): void {
    window.print();
  }

  async closeDocument(): Promise<void> {
    if (this.state.isDirty && this.currentDoc) {
      const save = await this.dialogs.showConfirmDialog('Save changes before closing?', 'Unsaved Changes');
      if (save === false) {
        // User canceled closing; abort close operation.
        return;
      }
      if (save) await this.saveDocument();
    }
    this.currentDoc = null;
    this.state.currentDocId = null;
    this.state.isDirty = false;
    localStorage.removeItem('lastDocId');
    this.showWelcome();
    document.querySelectorAll('.doc-list-item').forEach(el => el.classList.remove('active'));
  }

  setMode(mode: 'edit' | 'preview' | 'split'): void {
    this.state.mode = mode;
    const editorPane = document.getElementById('editor-pane')!;
    const previewPane = document.getElementById('preview-pane')!;
    const paneDivider = document.getElementById('pane-divider')!;

    editorPane.style.flexBasis = '';
    previewPane.style.flexBasis = '';

    switch (mode) {
      case 'edit':
        editorPane.style.display = 'flex';
        previewPane.style.display = 'none';
        paneDivider.style.display = 'none';
        break;
      case 'preview':
        editorPane.style.display = 'none';
        previewPane.style.display = 'flex';
        paneDivider.style.display = 'none';
        break;
      case 'split':
        editorPane.style.display = 'flex';
        previewPane.style.display = 'flex';
        paneDivider.style.display = 'block';
        break;
    }

    this.toolbar?.setMode(mode);
    this.updateStatusBar();
  }

  setZoom(zoom: number): void {
    this.state.zoom = Math.min(Math.max(zoom, 50), 200);
    const previewContent = document.getElementById('preview-content')!;
    previewContent.style.fontSize = `${16 * this.state.zoom / 100}px`;
    this.updateStatusBar();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.dataset['theme'] = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.editor?.setTheme(this.isDarkMode);

    const hljsTheme = document.getElementById('hljs-theme') as HTMLLinkElement | null;
    if (hljsTheme) {
      hljsTheme.href = this.isDarkMode
        ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.min.css'
        : 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css';
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    const sidebar = document.getElementById('sidebar')!;
    const resizer = document.getElementById('sidebar-resizer')!;
    sidebar.style.display = this.sidebarVisible ? '' : 'none';
    resizer.style.display = this.sidebarVisible ? '' : 'none';
  }

  insertFormatting(before: string, after: string): void {
    this.editor?.wrapSelection(before, after);
  }

  insertBlock(template: string): void {
    this.editor?.insertAtCursor(template);
  }

  clearFormatting(): void {
    const sel = this.editor?.getSelection() ?? '';
    // Strip markdown syntax and HTML tags thoroughly
    let clean = sel.replace(/[*_~`]/g, '');
    // Iteratively strip tags until none remain, then strip any residual angle brackets
    let prev = '';
    while (prev !== clean) {
      prev = clean;
      clean = clean.replace(/<[^>]*>/g, '');
    }
    clean = clean.replace(/[<>]/g, '');
    if (clean) this.editor?.insertAtCursor(clean);
  }

  async insertLinkDialog(): Promise<void> {
    const selectedText = this.editor?.getSelection() ?? '';
    const result = await this.dialogs.showLinkDialog(selectedText);
    if (result) {
      if (selectedText) {
        this.editor?.wrapSelection(`[`, `](${result.url})`);
      } else {
        this.editor?.insertAtCursor(`[${result.text}](${result.url})`);
      }
    }
  }

  async insertImageDialog(): Promise<void> {
    const result = await this.dialogs.showImageDialog();
    if (result) {
      this.editor?.insertAtCursor(`![${result.alt}](${result.url})`);
    }
  }

  async insertTableDialog(): Promise<void> {
    const result = await this.dialogs.showTableDialog();
    if (result) {
      const { rows, cols } = result;
      const header = '| ' + Array(cols).fill('Header').map((h: string, i: number) => `${h} ${i + 1}`).join(' | ') + ' |';
      const sep = '| ' + Array(cols).fill('---').join(' | ') + ' |';
      const dataRows = Array(rows - 1).fill(null).map(() => '| ' + Array(cols).fill('Cell').join(' | ') + ' |');
      this.editor?.insertAtCursor('\n' + [header, sep, ...dataRows].join('\n') + '\n');
    }
  }

  showFind(): void {
    this.dialogs.showFindReplaceDialog(
      (term) => {
        if (!term?.trim()) return;
        (window as Window & typeof globalThis & { find?: (s: string) => boolean }).find?.(term);
      },
      (find, replace) => {
        if (!find?.trim() || !this.currentDoc) return; // guard empty/whitespace find — would corrupt every character
        const newContent = this.currentDoc.content.split(find).join(replace);
        this.editor?.setValue(newContent);
        if (this.currentDoc) this.currentDoc.content = newContent;
      }
    );
  }

  showFindReplace(): void {
    this.showFind();
  }

  showWordCount(): void {
    const content = this.currentDoc?.content ?? '';
    this.dialogs.showWordCountDialog(content);
  }

  editDocumentCSS(): void {
    const css = this.currentDoc?.cssOverrides ?? '';
    this.dialogs.showCSSEditorDialog(css, async (newCss) => {
      if (this.currentDoc) {
        this.currentDoc.cssOverrides = newCss;
        this.applyCustomCSS();
        await this.saveDocument();
      }
    });
  }

  async refreshDocumentList(): Promise<void> {
    const listEl = document.getElementById('document-list')!;
    const docs = await this.storage.listDocuments();

    const frag = document.createDocumentFragment();

    if (docs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'doc-list-empty';
      empty.textContent = 'No documents yet';
      frag.appendChild(empty);
    } else {
      for (const doc of docs) {
        const item = document.createElement('div');
        item.className = 'doc-list-item' + (doc.id === this.state.currentDocId ? ' active' : '');
        item.dataset['id'] = doc.id;

        const nameEl = document.createElement('div');
        nameEl.className = 'doc-list-name';
        nameEl.textContent = doc.name; // textContent is XSS-safe — no escHtml needed

        const dateEl = document.createElement('div');
        dateEl.className = 'doc-list-date';
        dateEl.textContent = this.formatDate(doc.modified);

        item.append(nameEl, dateEl);

        item.addEventListener('click', () => this.openDocument(doc.id).catch(console.error));
        item.addEventListener('contextmenu', (e: Event) => {
          e.preventDefault();
          this.showDocContextMenu(e as MouseEvent, doc.id);
        });

        frag.appendChild(item);
      }
    }

    // Replace all children in a single DOM operation
    listEl.replaceChildren(frag);
  }

  private showDocContextMenu(e: MouseEvent, id: string): void {
    document.querySelector('.context-menu')?.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${e.clientX}px`;
    menu.style.top  = `${e.clientY}px`;

    const actions: Array<{ action: string; label: string; danger?: boolean }> = [
      { action: 'open',   label: 'Open' },
      { action: 'rename', label: 'Rename' },
      { action: 'delete', label: 'Delete', danger: true },
    ];

    for (const { action, label, danger } of actions) {
      const btn = document.createElement('button');
      btn.dataset['action'] = action;
      btn.textContent = label;
      if (danger) btn.className = 'danger';
      menu.appendChild(btn);
    }

    menu.addEventListener('click', async (ev: MouseEvent) => {
      const action = (ev.target as HTMLElement).dataset['action'];
      menu.remove();
      if (action === 'open')   await this.openDocument(id);
      if (action === 'rename') await this.renameDocument(id);
      if (action === 'delete') await this.deleteDocument(id);
    });

    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 0);
  }

  async renameDocument(id: string): Promise<void> {
    const doc = await this.storage.getDocument(id);
    if (!doc) return;
    const name = await this.dialogs.showNewDocumentDialog();
    if (!name) return;
    doc.name = name;
    await this.storage.saveDocument(doc);
    if (this.state.currentDocId === id) {
      const titleEl = document.getElementById('doc-title');
      if (titleEl) titleEl.textContent = name;
      if (this.currentDoc) this.currentDoc.name = name;
    }
    await this.refreshDocumentList();
  }

  async deleteDocument(id: string): Promise<void> {
    const confirmed = await this.dialogs.showConfirmDialog('Are you sure you want to delete this document? This cannot be undone.', 'Delete Document');
    if (!confirmed) return;
    await this.storage.deleteDocument(id);
    if (this.state.currentDocId === id) {
      await this.closeDocument();
    }
    await this.refreshDocumentList();
  }

  showWelcome(): void {
    const previewContent = document.getElementById('preview-content')!;
    const editorPane    = document.getElementById('editor-pane')!;
    const paneDivider   = document.getElementById('pane-divider')!;
    editorPane.style.display  = 'none';
    paneDivider.style.display = 'none';
    document.getElementById('doc-title')!.textContent = 'Welcome';

    // Build the welcome screen with DocumentFragment + createElement
    const frag   = document.createDocumentFragment();
    const screen = document.createElement('div');
    screen.className = 'welcome-screen';

    const logo = document.createElement('div');
    logo.className = 'welcome-logo';
    logo.textContent = 'W';

    const h1 = document.createElement('h1');
    h1.className = 'welcome-title';
    h1.textContent = 'Word';

    const subtitle = document.createElement('p');
    subtitle.className = 'welcome-subtitle';
    subtitle.textContent = 'A modern markdown word processor';

    // Action buttons — use template elements to parse SVG strings into real DOM nodes
    const actionsEl = document.createElement('div');
    actionsEl.className = 'welcome-actions';

    const newBtn  = this.makeBtnWithIcon(
      'welcome-btn primary',
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      'New Document',
    );
    newBtn.addEventListener('click', () => this.newDocument());

    const openBtn = this.makeBtnWithIcon(
      'welcome-btn',
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
      'Open Document',
    );
    openBtn.addEventListener('click', () => this.openDocumentDialog());

    actionsEl.append(newBtn, openBtn);

    // Feature list
    const featuresEl = document.createElement('div');
    featuresEl.className = 'welcome-features';
    const featureData: Array<[string, string]> = [
      ['Markdown',    'Full GFM support with live preview'],
      ['LaTeX Math',  'Inline $math$ and block $$math$$ via KaTeX'],
      ['Diagrams',    'Mermaid diagram support'],
      ['Offline',     'Works without internet via service worker'],
    ];
    for (const [title, desc] of featureData) {
      const feat   = document.createElement('div');
      feat.className = 'welcome-feature';
      const strong = document.createElement('strong');
      strong.textContent = title;
      feat.appendChild(strong);
      feat.appendChild(document.createTextNode(` — ${desc}`));
      featuresEl.appendChild(feat);
    }

    // Shortcut hints
    const shortcutsEl = document.createElement('div');
    shortcutsEl.className = 'welcome-shortcuts';
    const shortcutData: Array<[string, string]> = [
      ['Ctrl+N', 'New'], ['Ctrl+S', 'Save'], ['Ctrl+B', 'Bold'], ['Ctrl+I', 'Italic'],
    ];
    for (const [key, label] of shortcutData) {
      const span = document.createElement('span');
      const kbd  = document.createElement('kbd');
      kbd.textContent = key;
      span.appendChild(kbd);
      span.appendChild(document.createTextNode(` ${label}`));
      shortcutsEl.appendChild(span);
    }

    screen.append(logo, h1, subtitle, actionsEl, featuresEl, shortcutsEl);
    frag.appendChild(screen);

    // Replace all children in one operation
    previewContent.replaceChildren(frag);
  }

  updateStatusBar(): void {
    const content = this.currentDoc?.content ?? '';
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;

    const modeEl = document.getElementById('status-mode');
    const wordsEl = document.getElementById('status-words');
    const charsEl = document.getElementById('status-chars');
    const zoomEl = document.getElementById('status-zoom');

    if (modeEl) modeEl.textContent = this.state.mode.charAt(0).toUpperCase() + this.state.mode.slice(1);
    if (wordsEl) wordsEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    if (charsEl) charsEl.textContent = `${chars} chars`;
    if (zoomEl) zoomEl.textContent = `${this.state.zoom}%`;
  }

  setupAutoSave(): void {
    const raw = parseInt(localStorage.getItem('autosaveInterval') ?? '30', 10);
    const interval = Math.max(5000, (isNaN(raw) ? 30 : raw) * 1000);
    this.startAutoSaveTimer(interval);
  }

  private startAutoSaveTimer(intervalMs: number): void {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(async () => {
      if (this.state.isDirty && this.currentDoc) {
        await this.saveDocument();
      }
    }, intervalMs);
  }

  applySettings(settings: { autosaveInterval: number }): void {
    localStorage.setItem('autosaveInterval', String(settings.autosaveInterval));
    this.startAutoSaveTimer(settings.autosaveInterval * 1000);
  }

  private formatDate(ts: number): string {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  }

  /** Create a <button> containing a parsed SVG icon and a text label. */
  private makeBtnWithIcon(className: string, svgString: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = className;
    const tmpl = document.createElement('template');
    tmpl.innerHTML = svgString;
    btn.appendChild(tmpl.content.cloneNode(true));
    btn.appendChild(document.createTextNode(` ${label}`));
    return btn;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).app = app;
  app.init().catch(console.error);
});
