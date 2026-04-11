import type { Document } from './types.js';

export class StorageManager {
  private opfsRoot: FileSystemDirectoryHandle | null = null;
  private useLocalStorage = false;

  async init(): Promise<void> {
    try {
      this.opfsRoot = await navigator.storage.getDirectory();
      this.useLocalStorage = false;
    } catch {
      this.useLocalStorage = true;
    }
  }

  async listDocuments(): Promise<Document[]> {
    if (this.useLocalStorage || !this.opfsRoot) {
      const docs: Document[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doc_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) docs.push(JSON.parse(raw) as Document);
          } catch { /* skip */ }
        }
      }
      return docs.sort((a, b) => b.modified - a.modified);
    }
    const docs: Document[] = [];
    for await (const [name, handle] of this.opfsRoot.entries()) {
      if (name.endsWith('.json') && handle.kind === 'file') {
        try {
          const fh = handle as FileSystemFileHandle;
          const file = await fh.getFile();
          const text = await file.text();
          docs.push(JSON.parse(text) as Document);
        } catch { /* skip */ }
      }
    }
    return docs.sort((a, b) => b.modified - a.modified);
  }

  async getDocument(id: string): Promise<Document | null> {
    if (this.useLocalStorage || !this.opfsRoot) {
      const raw = localStorage.getItem(`doc_${id}`);
      return raw ? (JSON.parse(raw) as Document) : null;
    }
    try {
      const fh = await this.opfsRoot.getFileHandle(`${id}.json`);
      const file = await fh.getFile();
      const text = await file.text();
      return JSON.parse(text) as Document;
    } catch {
      return null;
    }
  }

  async saveDocument(doc: Document): Promise<void> {
    doc.modified = Date.now();
    if (this.useLocalStorage || !this.opfsRoot) {
      localStorage.setItem(`doc_${doc.id}`, JSON.stringify(doc));
      return;
    }
    const fh = await this.opfsRoot.getFileHandle(`${doc.id}.json`, { create: true });
    const writable = await fh.createWritable();
    await writable.write(JSON.stringify(doc));
    await writable.close();
  }

  async deleteDocument(id: string): Promise<void> {
    if (this.useLocalStorage || !this.opfsRoot) {
      localStorage.removeItem(`doc_${id}`);
      return;
    }
    try {
      await this.opfsRoot.removeEntry(`${id}.json`);
    } catch { /* ignore */ }
  }

  async importFile(file: File): Promise<Document> {
    const content = await file.text();
    const name = file.name.replace(/\.[^.]+$/, '');
    const doc: Document = {
      id: crypto.randomUUID(),
      name,
      content,
      created: Date.now(),
      modified: Date.now(),
    };
    await this.saveDocument(doc);
    return doc;
  }

  exportDocument(doc: Document): void {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}.md`;
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}
