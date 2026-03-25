/* eslint-disable @typescript-eslint/no-explicit-any */
export class ShortcutManager {
  private app: any;

  constructor(app: any) {
    this.app = app;
    this.register();
  }

  private register(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && !shift && e.key === 'n') { e.preventDefault(); this.app.newDocument(); return; }
      if (ctrl && !shift && e.key === 'o') { e.preventDefault(); this.app.openDocumentDialog(); return; }
      if (ctrl && !shift && e.key === 's') { e.preventDefault(); this.app.saveDocument(); return; }
      if (ctrl && shift && e.key === 'S') { e.preventDefault(); this.app.saveDocumentAs(); return; }
      if (ctrl && !shift && e.key === 'p') { e.preventDefault(); this.app.exportPDF(); return; }
      if (ctrl && !shift && e.key === '\\') { e.preventDefault(); this.app.setMode(this.app.state.mode === 'edit' ? 'split' : 'edit'); return; }
      if (ctrl && !shift && e.key === 'Enter') { e.preventDefault(); this.app.setMode(this.app.state.mode === 'preview' ? 'split' : 'preview'); return; }
      if (ctrl && !shift && e.key === 'f') { e.preventDefault(); this.app.showFind(); return; }
      if (ctrl && !shift && e.key === 'h') { e.preventDefault(); this.app.showFindReplace(); return; }
      if (ctrl && !shift && (e.key === '=' || e.key === '+')) { e.preventDefault(); this.app.setZoom(this.app.state.zoom + 10); return; }
      if (ctrl && !shift && e.key === '-') { e.preventDefault(); this.app.setZoom(this.app.state.zoom - 10); return; }
      if (ctrl && !shift && e.key === '0') { e.preventDefault(); this.app.setZoom(100); return; }
      if (e.key === 'F11') { e.preventDefault(); this.toggleFullscreen(); return; }
      if (ctrl && !shift && e.key === 'k') { e.preventDefault(); this.app.insertLinkDialog(); return; }
      if (ctrl && shift && e.key === 'M') { e.preventDefault(); this.app.insertBlock('\n$$\n\n$$\n'); return; }
    }, true);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}
