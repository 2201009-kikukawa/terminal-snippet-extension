export interface Snippet {
  id: string;
  name: string;
  command: string;
}

export interface Group {
  groupName: string;
  snippets: Snippet[];
}

export interface MenuItem {
  label: string;
  onClick: () => void;
}
