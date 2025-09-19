export interface Snippet {
  id: string;
  name: string;
  command: string[]; // ★ string から string[] に変更
  isEdit: boolean; // ★ この行を追加
}

export interface Group {
  id: string;
  groupName: string;
  snippets: Snippet[];
}

export interface MenuItem {
  label: string;
  onClick: () => void;
}
