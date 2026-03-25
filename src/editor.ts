import { EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  type ViewUpdate
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
  indentOnInput
} from '@codemirror/language';

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px' },
  '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", lineHeight: '1.6' },
  '.cm-content': { padding: '16px', minHeight: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  '.cm-line': { padding: '0 4px' },
  '.cm-focused': { outline: 'none' },
});

const darkEditorTheme = EditorView.theme({
  '&': { backgroundColor: '#1e1e2e', color: '#cdd6f4' },
  '.cm-content': { caretColor: '#cdd6f4' },
  '.cm-cursor': { borderLeftColor: '#cdd6f4' },
  '.cm-activeLine': { backgroundColor: '#313244' },
  '.cm-gutters': { backgroundColor: '#181825', borderRight: '1px solid #313244', color: '#6c7086' },
  '.cm-activeLineGutter': { backgroundColor: '#313244' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#45475a' },
  '.cm-matchingBracket': { backgroundColor: '#45475a', outline: '1px solid #7f849c' },
}, { dark: true });

export class Editor {
  private view: EditorView;
  public onChange: ((content: string) => void) | null = null;
  private isDark = false;

  constructor(container: HTMLElement, initialContent = '', dark = false) {
    this.isDark = dark;
    const extensions = this.buildExtensions(dark);

    const state = EditorState.create({
      doc: initialContent,
      extensions,
    });

    this.view = new EditorView({
      state,
      parent: container,
    });
  }

  private buildExtensions(dark: boolean): Extension[] {
    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      markdown(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.lineWrapping,
      editorTheme,
      ...(dark ? [darkEditorTheme] : []),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged && this.onChange) {
          this.onChange(this.view.state.doc.toString());
        }
      }),
    ];
  }

  getValue(): string {
    return this.view.state.doc.toString();
  }

  setValue(content: string): void {
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: content },
    });
  }

  insertAtCursor(text: string): void {
    const sel = this.view.state.selection.main;
    this.view.dispatch({
      changes: { from: sel.from, to: sel.to, insert: text },
      selection: { anchor: sel.from + text.length },
    });
    this.view.focus();
  }

  wrapSelection(before: string, after: string): void {
    const sel = this.view.state.selection.main;
    const selected = this.view.state.sliceDoc(sel.from, sel.to);
    const newText = `${before}${selected}${after}`;
    this.view.dispatch({
      changes: { from: sel.from, to: sel.to, insert: newText },
      selection: { anchor: sel.from + before.length, head: sel.from + before.length + selected.length },
    });
    this.view.focus();
  }

  getSelection(): string {
    const sel = this.view.state.selection.main;
    return this.view.state.sliceDoc(sel.from, sel.to);
  }

  focus(): void {
    this.view.focus();
  }

  undo(): void {
    undo(this.view);
    this.view.focus();
  }

  redo(): void {
    redo(this.view);
    this.view.focus();
  }

  selectAll(): void {
    this.view.dispatch({
      selection: { anchor: 0, head: this.view.state.doc.length },
    });
    this.view.focus();
  }

  destroy(): void {
    this.view.destroy();
  }

  setTheme(dark: boolean): void {
    if (this.isDark === dark) return;
    this.isDark = dark;
    const content = this.getValue();
    const container = this.view.dom.parentElement;
    if (!container) return;
    this.view.destroy();
    const extensions = this.buildExtensions(dark);
    const state = EditorState.create({ doc: content, extensions });
    this.view = new EditorView({ state, parent: container });
  }
}
