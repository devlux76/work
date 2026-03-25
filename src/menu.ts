/* eslint-disable @typescript-eslint/no-explicit-any */
export class MenuBar {
  private element: HTMLElement;
  private app: any;
  private activeMenu: HTMLElement | null = null;

  constructor(container: HTMLElement, app: any) {
    this.element = container;
    this.app = app;
    this.render();
    this.bindEvents();
  }

  private render(): void {
    const menus = [
      {
        label: 'File',
        items: [
          { label: 'New', action: 'newDocument', shortcut: 'Ctrl+N' },
          { label: 'Open...', action: 'openDocumentDialog', shortcut: 'Ctrl+O' },
          { label: 'Save', action: 'saveDocument', shortcut: 'Ctrl+S' },
          { label: 'Save As...', action: 'saveDocumentAs', shortcut: 'Ctrl+Shift+S' },
          { type: 'sep' },
          { label: 'Import...', action: 'importDocument' },
          { label: 'Export as Markdown', action: 'exportMarkdown' },
          { label: 'Export as PDF', action: 'exportPDF' },
          { type: 'sep' },
          { label: 'Close', action: 'closeDocument' },
        ],
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', action: 'editorUndo', shortcut: 'Ctrl+Z' },
          { label: 'Redo', action: 'editorRedo', shortcut: 'Ctrl+Y' },
          { type: 'sep' },
          { label: 'Cut', action: 'execCut', shortcut: 'Ctrl+X' },
          { label: 'Copy', action: 'execCopy', shortcut: 'Ctrl+C' },
          { label: 'Paste', action: 'execPaste', shortcut: 'Ctrl+V' },
          { label: 'Select All', action: 'execSelectAll', shortcut: 'Ctrl+A' },
          { type: 'sep' },
          { label: 'Find...', action: 'showFind', shortcut: 'Ctrl+F' },
          { label: 'Find & Replace...', action: 'showFindReplace', shortcut: 'Ctrl+H' },
        ],
      },
      {
        label: 'View',
        items: [
          { label: 'Toggle Source', action: 'toggleEdit', shortcut: 'Ctrl+\\' },
          { label: 'Split View', action: 'setSplit' },
          { label: 'Preview Only', action: 'setPreview' },
          { type: 'sep' },
          { label: 'Zoom In', action: 'zoomIn', shortcut: 'Ctrl+=' },
          { label: 'Zoom Out', action: 'zoomOut', shortcut: 'Ctrl+-' },
          { label: 'Reset Zoom', action: 'zoomReset', shortcut: 'Ctrl+0' },
          { type: 'sep' },
          { label: 'Toggle Dark Mode', action: 'toggleDarkMode' },
          { label: 'Toggle Sidebar', action: 'toggleSidebar' },
        ],
      },
      {
        label: 'Insert',
        items: [
          { label: 'Link', action: 'insertLinkDialog', shortcut: 'Ctrl+K' },
          { label: 'Image', action: 'insertImageDialog' },
          { label: 'Table', action: 'insertTableDialog' },
          { label: 'Code Block', action: 'insertCodeBlock' },
          { label: 'Inline Math', action: 'insertInlineMath' },
          { label: 'Math Block', action: 'insertMathBlock', shortcut: 'Ctrl+Shift+M' },
          { label: 'Mermaid Diagram', action: 'insertMermaidBlock' },
          { type: 'sep' },
          { label: 'Horizontal Rule', action: 'insertHR' },
          { label: 'Blockquote', action: 'insertQuote' },
        ],
      },
      {
        label: 'Format',
        items: [
          { label: 'Bold', action: 'bold', shortcut: 'Ctrl+B' },
          { label: 'Italic', action: 'italic', shortcut: 'Ctrl+I' },
          { label: 'Underline', action: 'underline', shortcut: 'Ctrl+U' },
          { label: 'Strikethrough', action: 'strikethrough' },
          { type: 'sep' },
          { label: 'Code', action: 'inlineCode' },
          { type: 'sep' },
          { label: 'Heading 1', action: 'heading1' },
          { label: 'Heading 2', action: 'heading2' },
          { label: 'Heading 3', action: 'heading3' },
          { label: 'Heading 4', action: 'heading4' },
          { label: 'Heading 5', action: 'heading5' },
          { label: 'Heading 6', action: 'heading6' },
          { type: 'sep' },
          { label: 'Blockquote', action: 'insertQuote' },
          { type: 'sep' },
          { label: 'Clear Formatting', action: 'clearFormatting' },
        ],
      },
      {
        label: 'Tools',
        items: [
          { label: 'Word Count', action: 'showWordCount' },
          { type: 'sep' },
          { label: 'Edit Document CSS', action: 'editDocumentCSS' },
          { type: 'sep' },
          { label: 'Settings', action: 'showSettings' },
        ],
      },
      {
        label: 'Help',
        items: [
          { label: 'Keyboard Shortcuts', action: 'showShortcuts' },
          { type: 'sep' },
          { label: 'About', action: 'showAbout' },
        ],
      },
    ];

    this.element.innerHTML = menus.map(menu => `
      <div class="menu-item" data-menu="${menu.label}">
        <span class="menu-label">${menu.label}</span>
        <div class="menu-dropdown">
          ${menu.items.map(item => {
            if ('type' in item && item.type === 'sep') return '<div class="menu-sep"></div>';
            const menuItem = item as { label: string; action: string; shortcut?: string };
            return `<button class="menu-action" data-action="${menuItem.action}">
              <span>${menuItem.label}</span>
              ${menuItem.shortcut ? `<span class="menu-shortcut">${menuItem.shortcut}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  private bindEvents(): void {
    this.element.addEventListener('click', (e: MouseEvent) => {
      const menuItem = (e.target as HTMLElement).closest('.menu-item') as HTMLElement | null;
      const action = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;

      if (action) {
        const act = action.dataset['action']!;
        this.close();
        this.handleAction(act);
        return;
      }

      if (menuItem) {
        if (this.activeMenu === menuItem) {
          this.close();
        } else {
          this.open(menuItem);
        }
        return;
      }
    });

    this.element.addEventListener('mouseenter', (e: MouseEvent) => {
      if (!this.activeMenu) return;
      const menuItem = (e.target as HTMLElement).closest('.menu-item') as HTMLElement | null;
      if (menuItem && menuItem !== this.activeMenu) {
        this.open(menuItem);
      }
    }, true);

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.element.contains(e.target as Node)) this.close();
    });
  }

  private open(menuItem: HTMLElement): void {
    if (this.activeMenu) {
      this.activeMenu.classList.remove('open');
    }
    this.activeMenu = menuItem;
    menuItem.classList.add('open');
  }

  private close(): void {
    if (this.activeMenu) {
      this.activeMenu.classList.remove('open');
      this.activeMenu = null;
    }
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'newDocument': this.app.newDocument(); break;
      case 'openDocumentDialog': this.app.openDocumentDialog(); break;
      case 'saveDocument': this.app.saveDocument(); break;
      case 'saveDocumentAs': this.app.saveDocumentAs(); break;
      case 'importDocument': this.app.importDocument(); break;
      case 'exportMarkdown': this.app.exportMarkdown(); break;
      case 'exportPDF': this.app.exportPDF(); break;
      case 'closeDocument': this.app.closeDocument(); break;
      case 'editorUndo': this.app.editor?.undo(); break;
      case 'editorRedo': this.app.editor?.redo(); break;
      case 'execCut': navigator.clipboard.writeText(window.getSelection()?.toString() ?? '').catch(() => document.execCommand('cut')); break;
      case 'execCopy': navigator.clipboard.writeText(window.getSelection()?.toString() ?? '').catch(() => document.execCommand('copy')); break;
      case 'execPaste': navigator.clipboard.readText().then(text => this.app.editor?.insertAtCursor(text)).catch(() => document.execCommand('paste')); break;
      case 'execSelectAll': this.app.editor?.selectAll(); break;
      case 'showFind': this.app.showFind(); break;
      case 'showFindReplace': this.app.showFindReplace(); break;
      case 'toggleEdit': this.app.setMode(this.app.state.mode === 'edit' ? 'split' : 'edit'); break;
      case 'setSplit': this.app.setMode('split'); break;
      case 'setPreview': this.app.setMode('preview'); break;
      case 'zoomIn': this.app.setZoom(this.app.state.zoom + 10); break;
      case 'zoomOut': this.app.setZoom(this.app.state.zoom - 10); break;
      case 'zoomReset': this.app.setZoom(100); break;
      case 'toggleDarkMode': this.app.toggleDarkMode(); break;
      case 'toggleSidebar': this.app.toggleSidebar(); break;
      case 'insertLinkDialog': this.app.insertLinkDialog(); break;
      case 'insertImageDialog': this.app.insertImageDialog(); break;
      case 'insertTableDialog': this.app.insertTableDialog(); break;
      case 'insertCodeBlock': this.app.insertBlock('\n```\n\n```\n'); break;
      case 'insertInlineMath': this.app.insertFormatting('$', '$'); break;
      case 'insertMathBlock': this.app.insertBlock('\n$$\n\n$$\n'); break;
      case 'insertMermaidBlock': this.app.insertBlock('\n```mermaid\ngraph TD\n  A --> B\n```\n'); break;
      case 'insertHR': this.app.insertBlock('\n---\n'); break;
      case 'insertQuote': this.app.insertBlock('> '); break;
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
      case 'clearFormatting': this.app.clearFormatting(); break;
      case 'showWordCount': this.app.showWordCount(); break;
      case 'editDocumentCSS': this.app.editDocumentCSS(); break;
      case 'showSettings': this.app.dialogs.showAboutDialog(); break;
      case 'showShortcuts': this.app.dialogs.showKeyboardShortcutsDialog(); break;
      case 'showAbout': this.app.dialogs.showAboutDialog(); break;
    }
  }
}
