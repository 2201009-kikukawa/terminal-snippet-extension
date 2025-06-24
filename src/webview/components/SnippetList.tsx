import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import MeatballMenu from "./MeatballMenu";
import { Snippet } from "../types";

interface SnippetListProps {
  snippets: Snippet[];
  onRunSnippet: (command: string) => void;
  onEditSnippet: (snippet: Snippet, index: number) => void;
  onDeleteSnippet: (snippet: Snippet, index: number) => void;
  openMenuIndex: number | null;
  selectedMenuItem: string;
  onMenuToggle: (index: number) => void;
  onMenuItemSelect: (item: string) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  openMenuIndex,
  onMenuToggle,
  onMenuItemSelect,
}) => {
  const handleMenuItemClick = (action: string, snippet: Snippet, index: number) => {
    onMenuItemSelect(action);

    if (action === "削除") {
      onDeleteSnippet(snippet, index);
    } else if (action === "編集") {
      onEditSnippet(snippet, index);
    }
  };

  if (snippets.length === 0) {
    return <p>スニペットはまだありません</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", marginBottom: "1em" }}>
      {snippets.map((snippet, index) => (
        <div key={index} className="snippet-item">
          <VSCodeButton
            appearance="secondary"
            className="snippet-name-button"
            onClick={() => onRunSnippet(snippet.command)}>
            {snippet.name}
          </VSCodeButton>
          <MeatballMenu
            menuItems={[
              {
                label: "削除",
                onClick: () => handleMenuItemClick("削除", snippet, index),
              },
              {
                label: "編集",
                onClick: () => handleMenuItemClick("編集", snippet, index),
              },
            ]}
            isOpen={openMenuIndex === index}
            onToggle={() => onMenuToggle(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default SnippetList;
