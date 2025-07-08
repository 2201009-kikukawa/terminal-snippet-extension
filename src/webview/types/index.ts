export interface Snippet {
  name: string;
  command: string;
}

export interface MenuItem {
  label: string;
  onClick: () => void;
}
