/* eslint-disable @typescript-eslint/no-explicit-any */
export class Toolbar {
  private element: HTMLElement;
  private app: any;

  constructor(container: HTMLElement, app: any) {
    this.element = container;
    this.app = app;
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="toolbar-inner">
        <div class="toolbar-group">
          <button class="tb-btn" data-action="newDocument" title="New (Ctrl+N)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </button>
          <button class="tb-btn" data-action="openDocument" title="Open (Ctrl+O)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button class="tb-btn" data-action="saveDocument" title="Save (Ctrl+S)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
          <button class="tb-btn" data-action="exportMarkdown" title="Export Markdown">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="tb-btn" data-action="exportPDF" title="Print / Export PDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" data-action="undo" title="Undo (Ctrl+Z)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.75"/></svg>
          </button>
          <button class="tb-btn" data-action="redo" title="Redo (Ctrl+Y)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.75"/></svg>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group mode-group">
          <button class="tb-btn mode-btn" data-action="setModeEdit" data-mode="edit" title="Edit Mode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
          <button class="tb-btn mode-btn active" data-action="setModeSplit" data-mode="split" title="Split View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            <span>Split</span>
          </button>
          <button class="tb-btn mode-btn" data-action="setModePreview" data-mode="preview" title="Preview Mode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Preview</span>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" data-action="bold" title="Bold (Ctrl+B)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          </button>
          <button class="tb-btn" data-action="italic" title="Italic (Ctrl+I)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
          </button>
          <button class="tb-btn" data-action="underline" title="Underline (Ctrl+U)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
          </button>
          <button class="tb-btn" data-action="strikethrough" title="Strikethrough">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 5.5C16.5 4 14.9 3 12.8 3c-3.3 0-5.3 2-5.3 4.2 0 1 .3 1.8.8 2.4"/><path d="M6.5 18.5C7.5 20 9.1 21 11.2 21c3.3 0 5.3-2 5.3-4.2 0-1-.3-1.8-.8-2.4"/></svg>
          </button>
          <button class="tb-btn" data-action="inlineCode" title="Inline Code">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <div class="tb-dropdown-wrap">
            <button class="tb-btn tb-dropdown-btn" title="Headings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              <span>H</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="tb-dropdown">
              <button data-action="heading1">H1 Heading 1</button>
              <button data-action="heading2">H2 Heading 2</button>
              <button data-action="heading3">H3 Heading 3</button>
              <button data-action="heading4">H4 Heading 4</button>
              <button data-action="heading5">H5 Heading 5</button>
              <button data-action="heading6">H6 Heading 6</button>
            </div>
          </div>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" data-action="bulletList" title="Bullet List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>
          </button>
          <button class="tb-btn" data-action="numberedList" title="Numbered List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </button>
          <button class="tb-btn" data-action="taskList" title="Task List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" data-action="insertLink" title="Link (Ctrl+K)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <button class="tb-btn" data-action="insertImage" title="Image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button class="tb-btn" data-action="insertTable" title="Table">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </button>
          <button class="tb-btn" data-action="insertCodeBlock" title="Code Block">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <button class="tb-btn" data-action="insertMath" title="Math Block (Ctrl+Shift+M)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="8" y2="6"/><line x1="4" y1="18" x2="8" y2="18"/></svg>
          </button>
          <button class="tb-btn" data-action="insertMermaid" title="Mermaid Diagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>
          </button>
          <button class="tb-btn" data-action="insertHR" title="Horizontal Rule">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
          </button>
          <button class="tb-btn" data-action="insertQuote" title="Blockquote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" data-action="zoomOut" title="Zoom Out (Ctrl+-)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="tb-btn" data-action="zoomIn" title="Zoom In (Ctrl+=)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    this.element.addEventListener('click', (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!btn) return;
      const action = btn.dataset['action'];
      if (!action) return;

      // Close any open dropdowns
      this.element.querySelectorAll('.tb-dropdown.open').forEach(d => d.classList.remove('open'));

      switch (action) {
        case 'newDocument': this.app.newDocument(); break;
        case 'openDocument': this.app.openDocumentDialog(); break;
        case 'saveDocument': this.app.saveDocument(); break;
        case 'exportMarkdown': this.app.exportMarkdown(); break;
        case 'exportPDF': this.app.exportPDF(); break;
        case 'undo': this.app.editor?.undo(); break;
        case 'redo': this.app.editor?.redo(); break;
        case 'setModeEdit': this.app.setMode('edit'); break;
        case 'setModeSplit': this.app.setMode('split'); break;
        case 'setModePreview': this.app.setMode('preview'); break;
        case 'bold': this.app.insertFormatting('**', '**'); break;
        case 'italic': this.app.insertFormatting('*', '*'); break;
        case 'underline': this.app.insertFormatting('<u>', '</u>'); break;
        case 'strikethrough': this.app.insertFormatting('~~', '~~'); break;
        case 'inlineCode': this.app.insertFormatting('`', '`'); break;
        case 'heading1': this.app.insertBlock('# '); break;
        case 'heading2': this.app.insertBlock('## '); break;
        case 'heading3': this.app.insertBlock('### '); break;
        case 'heading4': this.app.insertBlock('#### '); break;
        case 'heading5': this.app.insertBlock('##### '); break;
        case 'heading6': this.app.insertBlock('###### '); break;
        case 'bulletList': this.app.insertBlock('- '); break;
        case 'numberedList': this.app.insertBlock('1. '); break;
        case 'taskList': this.app.insertBlock('- [ ] '); break;
        case 'insertLink': this.app.insertLinkDialog(); break;
        case 'insertImage': this.app.insertImageDialog(); break;
        case 'insertTable': this.app.insertTableDialog(); break;
        case 'insertCodeBlock': this.app.insertBlock('\n```\n\n```\n'); break;
        case 'insertMath': this.app.insertBlock('\n$$\n\n$$\n'); break;
        case 'insertMermaid': this.app.insertBlock('\n```mermaid\ngraph TD\n  A --> B\n```\n'); break;
        case 'insertHR': this.app.insertBlock('\n---\n'); break;
        case 'insertQuote': this.app.insertBlock('> '); break;
        case 'zoomIn': this.app.setZoom(this.app.state.zoom + 10); break;
        case 'zoomOut': this.app.setZoom(this.app.state.zoom - 10); break;
      }
    });

    // Dropdown toggle
    this.element.addEventListener('click', (e: MouseEvent) => {
      const dropBtn = (e.target as HTMLElement).closest('.tb-dropdown-btn') as HTMLElement | null;
      if (dropBtn) {
        e.stopPropagation();
        const wrap = dropBtn.closest('.tb-dropdown-wrap');
        const dropdown = wrap?.querySelector('.tb-dropdown');
        dropdown?.classList.toggle('open');
      }
    });

    document.addEventListener('click', () => {
      this.element.querySelectorAll('.tb-dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }

  setMode(mode: 'edit' | 'preview' | 'split'): void {
    this.element.querySelectorAll('.mode-btn').forEach(btn => {
      const b = btn as HTMLElement;
      b.classList.toggle('active', b.dataset['mode'] === mode);
    });
  }

  setDirty(_dirty: boolean): void { }
}
