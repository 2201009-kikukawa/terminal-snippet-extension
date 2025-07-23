export interface Snippet {
  id: string;
  name: string;
  command: string;
}

// ★ Group インターフェースに id を追加
export interface Group {
  id: string; // ★ 追加
  groupName: string;
  snippets: Snippet[];
}

export interface MenuItem {
  label: string;
  onClick: () => void;
}
