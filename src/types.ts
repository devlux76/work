export interface Document {
  id: string;
  name: string;
  content: string;
  created: number;
  modified: number;
  cssOverrides?: string;
}

export interface AppState {
  currentDocId: string | null;
  mode: 'edit' | 'preview' | 'split';
  isDirty: boolean;
  zoom: number;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

/** Typed contract for the App class exposed to Toolbar, MenuBar, ShortcutManager. */
export interface AppInterface {
  readonly state: AppState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly dialogs: any; // DialogManager — avoids circular import
  editor: {
    undo(): void;
    redo(): void;
    insertAtCursor(text: string): void;
    wrapSelection(before: string, after: string): void;
    getSelection(): string;
    selectAll(): void;
    getValue(): string;
    setValue(content: string): void;
    focus(): void;
    setTheme(dark: boolean): void;
    destroy(): void;
    onChange: ((content: string) => void) | null;
  } | null;
  newDocument(name?: string): Promise<void>;
  openDocumentDialog(): Promise<void>;
  saveDocument(): Promise<void>;
  saveDocumentAs(): Promise<void>;
  importDocument(): Promise<void>;
  exportMarkdown(): void;
  exportPDF(): void;
  closeDocument(): Promise<void>;
  setMode(mode: 'edit' | 'preview' | 'split'): void;
  setZoom(zoom: number): void;
  toggleDarkMode(): void;
  toggleSidebar(): void;
  insertFormatting(before: string, after?: string): void;
  insertBlock(template: string): void;
  clearFormatting(): void;
  insertLinkDialog(): Promise<void>;
  insertImageDialog(): Promise<void>;
  insertTableDialog(): Promise<void>;
  showFind(): void;
  showFindReplace(): void;
  showWordCount(): void;
  editDocumentCSS(): void;
}
