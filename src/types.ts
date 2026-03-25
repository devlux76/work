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
