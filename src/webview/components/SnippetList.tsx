import React from "react";
import { Snippet } from "../types";
import MeatballMenu from "./meatball/MeatballMenu";
import Button from "./common/Button";

interface SnippetListProps {
  snippets: Snippet[];
  onRunSnippet: (command: string) => void;
  onEditSnippet: (snippet: Snippet, index: number) => void;
  onDeleteSnippet: (id: string) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
}) => {
  const handleDelete = (id: string) => {
    onDeleteSnippet(id);
  };

  const handleEdit = (snippet: Snippet, index: number) => {
    onEditSnippet(snippet, index);
  };

  if (snippets.length === 0) {
    return <p>スニペットはまだありません</p>;
  }

  return (
    <div className="snippet-list">
      {snippets.map((snippet, index) => (
        <div key={snippet.id} className="snippet-item">
          <Button
            appearance="secondary"
            className="snippet-name-button"
            title={snippet.command}
            onClick={() => onRunSnippet(snippet.command)}>
            {snippet.name}
          </Button>
          <MeatballMenu
            id={`meatball-menu-${snippet.id}`}
            menuItems={[
              {
                label: "削除",
                onClick: () => handleDelete(snippet.id),
              },
              {
                label: "編集",
                onClick: () => handleEdit(snippet, index),
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export default SnippetList;
