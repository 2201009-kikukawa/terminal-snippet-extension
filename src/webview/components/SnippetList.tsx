import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { MeatballMenu } from "./meatball";
import { Snippet } from "../types";

interface SnippetListProps {
  snippets: Snippet[];
  onRunSnippet: (command: string) => void;
  onEditSnippet: (snippet: Snippet, index: number) => void;
  onDeleteSnippet: (snippet: Snippet, index: number) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
}) => {
  const handleDelete = (snippet: Snippet, index: number) => {
    onDeleteSnippet(snippet, index);
  };

  const handleEdit = (snippet: Snippet, index: number) => {
    onEditSnippet(snippet, index);
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
            id={`snippet-${index}`} //現在はmapのindexを使用。いずれuuidで判断するように修正
            menuItems={[
              {
                label: "削除",
                onClick: () => handleDelete(snippet, index),
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
