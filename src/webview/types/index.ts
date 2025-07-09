export interface Snippet {
  id: string;
  name: string;
  command: string;
}

export interface MenuItem {
  label: string;
  onClick: () => void;
}
