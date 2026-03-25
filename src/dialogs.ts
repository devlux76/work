import type { Document } from './types.js';

interface DialogButton {
  label: string;
  primary?: boolean;
  danger?: boolean;
  action: () => void;
}

export class DialogManager {
  async showNewDocumentDialog(): Promise<string | null> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="dialog-field">
          <label for="doc-name-input">Document Name</label>
          <input type="text" id="doc-name-input" placeholder="My Document" value="Untitled Document" autocomplete="off">
        </div>
      `;
      const input = content.querySelector('#doc-name-input') as HTMLInputElement;
      const dialog = this.createDialog('New Document', content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(null); } },
        { label: 'Create', primary: true, action: () => { this.closeDialog(dialog); resolve(input.value.trim() || 'Untitled'); } },
      ]);
      setTimeout(() => { input.select(); }, 50);
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') { this.closeDialog(dialog); resolve(input.value.trim() || 'Untitled'); }
        if (e.key === 'Escape') { this.closeDialog(dialog); resolve(null); }
      });
    });
  }

  async showOpenDocumentDialog(documents: Document[]): Promise<string | null> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      if (documents.length === 0) {
        content.innerHTML = '<p class="dialog-empty">No documents found. Create a new document to get started.</p>';
      } else {
        content.innerHTML = `
          <div class="dialog-doc-list">
            ${documents.map(doc => `
              <button class="dialog-doc-item" data-id="${doc.id}">
                <span class="dialog-doc-name">${this.escHtml(doc.name)}</span>
                <span class="dialog-doc-date">${new Date(doc.modified).toLocaleDateString()}</span>
              </button>
            `).join('')}
          </div>
        `;
        content.querySelectorAll('.dialog-doc-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset['id']!;
            this.closeDialog(dialog);
            resolve(id);
          });
        });
      }
      const dialog = this.createDialog('Open Document', content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(null); } },
      ]);
    });
  }

  async showLinkDialog(selectedText = ''): Promise<{ text: string; url: string } | null> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="dialog-field">
          <label for="link-text">Link Text</label>
          <input type="text" id="link-text" value="${this.escHtml(selectedText)}" placeholder="Link text">
        </div>
        <div class="dialog-field">
          <label for="link-url">URL</label>
          <input type="url" id="link-url" placeholder="https://example.com">
        </div>
      `;
      const textInput = content.querySelector('#link-text') as HTMLInputElement;
      const urlInput = content.querySelector('#link-url') as HTMLInputElement;
      const dialog = this.createDialog('Insert Link', content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(null); } },
        { label: 'Insert', primary: true, action: () => {
          this.closeDialog(dialog);
          resolve({ text: textInput.value || urlInput.value, url: urlInput.value });
        }},
      ]);
      setTimeout(() => { (selectedText ? urlInput : textInput).focus(); }, 50);
    });
  }

  async showImageDialog(): Promise<{ alt: string; url: string } | null> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="dialog-field">
          <label for="img-url">Image URL</label>
          <input type="url" id="img-url" placeholder="https://example.com/image.png">
        </div>
        <div class="dialog-field">
          <label for="img-alt">Alt Text</label>
          <input type="text" id="img-alt" placeholder="Image description">
        </div>
      `;
      const urlInput = content.querySelector('#img-url') as HTMLInputElement;
      const altInput = content.querySelector('#img-alt') as HTMLInputElement;
      const dialog = this.createDialog('Insert Image', content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(null); } },
        { label: 'Insert', primary: true, action: () => {
          this.closeDialog(dialog);
          resolve({ alt: altInput.value, url: urlInput.value });
        }},
      ]);
      setTimeout(() => urlInput.focus(), 50);
    });
  }

  async showTableDialog(): Promise<{ rows: number; cols: number } | null> {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="dialog-field-row">
          <div class="dialog-field">
            <label for="table-rows">Rows</label>
            <input type="number" id="table-rows" value="3" min="1" max="50">
          </div>
          <div class="dialog-field">
            <label for="table-cols">Columns</label>
            <input type="number" id="table-cols" value="3" min="1" max="20">
          </div>
        </div>
      `;
      const rowsInput = content.querySelector('#table-rows') as HTMLInputElement;
      const colsInput = content.querySelector('#table-cols') as HTMLInputElement;
      const dialog = this.createDialog('Insert Table', content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(null); } },
        { label: 'Insert', primary: true, action: () => {
          this.closeDialog(dialog);
          resolve({ rows: parseInt(rowsInput.value) || 3, cols: parseInt(colsInput.value) || 3 });
        }},
      ]);
      setTimeout(() => rowsInput.focus(), 50);
    });
  }

  showFindReplaceDialog(onFind: (term: string) => void, onReplace: (find: string, replace: string) => void): void {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="dialog-field">
        <label for="find-term">Find</label>
        <input type="text" id="find-term" placeholder="Search text">
      </div>
      <div class="dialog-field">
        <label for="replace-term">Replace</label>
        <input type="text" id="replace-term" placeholder="Replacement text">
      </div>
    `;
    const findInput = content.querySelector('#find-term') as HTMLInputElement;
    const replaceInput = content.querySelector('#replace-term') as HTMLInputElement;
    const dialog = this.createDialog('Find & Replace', content, [
      { label: 'Close', action: () => this.closeDialog(dialog) },
      { label: 'Find', action: () => onFind(findInput.value) },
      { label: 'Replace All', primary: true, action: () => onReplace(findInput.value, replaceInput.value) },
    ]);
    setTimeout(() => findInput.focus(), 50);
  }

  showWordCountDialog(content: string): void {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const charsNoSpaces = content.replace(/\s/g, '').length;
    const lines = content.split('\n').length;
    const contentEl = document.createElement('div');
    contentEl.innerHTML = `
      <div class="word-count-grid">
        <div class="wc-item"><span class="wc-num">${words.toLocaleString()}</span><span class="wc-label">Words</span></div>
        <div class="wc-item"><span class="wc-num">${chars.toLocaleString()}</span><span class="wc-label">Characters</span></div>
        <div class="wc-item"><span class="wc-num">${charsNoSpaces.toLocaleString()}</span><span class="wc-label">Characters (no spaces)</span></div>
        <div class="wc-item"><span class="wc-num">${lines.toLocaleString()}</span><span class="wc-label">Lines</span></div>
      </div>
    `;
    const dialog = this.createDialog('Word Count', contentEl, [
      { label: 'Close', primary: true, action: () => this.closeDialog(dialog) },
    ]);
  }

  showCSSEditorDialog(css: string, onSave: (css: string) => void): void {
    const content = document.createElement('div');
    content.innerHTML = `
      <p class="dialog-hint">Add custom CSS for this document's preview:</p>
      <textarea id="css-editor" class="css-editor-textarea" spellcheck="false" placeholder="/* Custom CSS */">${this.escHtml(css)}</textarea>
    `;
    const textarea = content.querySelector('#css-editor') as HTMLTextAreaElement;
    const dialog = this.createDialog('Edit Document CSS', content, [
      { label: 'Cancel', action: () => this.closeDialog(dialog) },
      { label: 'Save', primary: true, action: () => { this.closeDialog(dialog); onSave(textarea.value); } },
    ]);
    setTimeout(() => textarea.focus(), 50);
  }

  showKeyboardShortcutsDialog(): void {
    const shortcuts = [
      ['Ctrl+N', 'New Document'],
      ['Ctrl+O', 'Open Document'],
      ['Ctrl+S', 'Save'],
      ['Ctrl+Shift+S', 'Save As'],
      ['Ctrl+P', 'Print / Export PDF'],
      ['Ctrl+Z', 'Undo'],
      ['Ctrl+Y', 'Redo'],
      ['Ctrl+B', 'Bold'],
      ['Ctrl+I', 'Italic'],
      ['Ctrl+U', 'Underline'],
      ['Ctrl+K', 'Insert Link'],
      ['Ctrl+\\', 'Toggle Edit/Split'],
      ['Ctrl+Enter', 'Toggle Preview'],
      ['Ctrl+F', 'Find'],
      ['Ctrl+H', 'Find & Replace'],
      ['Ctrl+Shift+M', 'Insert Math Block'],
      ['Ctrl+=', 'Zoom In'],
      ['Ctrl+-', 'Zoom Out'],
      ['Ctrl+0', 'Reset Zoom'],
      ['F11', 'Fullscreen'],
      ['Escape', 'Close Dialog'],
    ];
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="shortcuts-grid">
        ${shortcuts.map(([key, desc]) => `
          <kbd>${key}</kbd><span>${desc}</span>
        `).join('')}
      </div>
    `;
    const dialog = this.createDialog('Keyboard Shortcuts', content, [
      { label: 'Close', primary: true, action: () => this.closeDialog(dialog) },
    ]);
  }

  showAboutDialog(): void {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="about-content">
        <div class="about-logo">W</div>
        <h2>Word</h2>
        <p>Markdown Word Processor</p>
        <p class="about-version">Version 1.0.0</p>
        <p class="about-desc">A modern, offline-first word processor for Markdown and LaTeX documents. Built with CodeMirror 6, marked, KaTeX, and Mermaid.</p>
      </div>
    `;
    const dialog = this.createDialog('About Word', content, [
      { label: 'Close', primary: true, action: () => this.closeDialog(dialog) },
    ]);
  }

  async showConfirmDialog(message: string, title = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      const content = document.createElement('p');
      content.textContent = message;
      const dialog = this.createDialog(title, content, [
        { label: 'Cancel', action: () => { this.closeDialog(dialog); resolve(false); } },
        { label: 'Confirm', danger: true, action: () => { this.closeDialog(dialog); resolve(true); } },
      ]);
    });
  }

  private createDialog(title: string, content: HTMLElement | string, buttons: DialogButton[] = []): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const header = document.createElement('div');
    header.className = 'dialog-header';
    header.innerHTML = `<h3>${title}</h3><button class="dialog-close" aria-label="Close">&#x2715;</button>`;

    const body = document.createElement('div');
    body.className = 'dialog-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.textContent = btn.label;
      b.className = 'dialog-btn' + (btn.primary ? ' primary' : '') + (btn.danger ? ' danger' : '');
      b.addEventListener('click', btn.action);
      footer.appendChild(b);
    });

    dialog.appendChild(header);
    dialog.appendChild(body);
    if (buttons.length) dialog.appendChild(footer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    header.querySelector('.dialog-close')!.addEventListener('click', () => this.closeDialog(overlay));

    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) this.closeDialog(overlay);
    });

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { this.closeDialog(overlay); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    requestAnimationFrame(() => overlay.classList.add('open'));

    return overlay;
  }

  private closeDialog(dialog: HTMLElement): void {
    dialog.classList.remove('open');
    setTimeout(() => dialog.remove(), 200);
  }

  private escHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
