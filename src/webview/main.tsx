import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useSnippets, useMenu } from "./hooks";
import { SnippetList, SnippetForm } from "./components";
import { Snippet } from "./types";
import "./styles.css";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { snippets, addSnippet, deleteSnippet, runSnippet } = useSnippets();
  const { openMenuIndex, selectedMenuItem, toggleMenu, selectMenuItem } = useMenu();

  const handleAddSnippet = (snippet: Snippet) => {
    addSnippet(snippet);
    alert("登録されました");
    setShowForm(false);
  };
  const handleDeleteSnippet = (snippet: Snippet, index: number) => {
    deleteSnippet(snippet, index);
  };

  const handleEditSnippet = (snippet: Snippet, index: number) => {
    // 編集機能は後で実装
    handleDeleteSnippet(snippet, index);
  };

  return (
    <>
      <SnippetList
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
        openMenuIndex={openMenuIndex}
        selectedMenuItem={selectedMenuItem}
        onMenuToggle={toggleMenu}
        onMenuItemSelect={selectMenuItem}
      />
      <VSCodeButton appearance="icon" onClick={() => setShowForm(true)}>
        <span className="add-button-icon">＋</span>
      </VSCodeButton>{" "}
      {showForm && <SnippetForm onSubmit={handleAddSnippet} onCancel={() => setShowForm(false)} />}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
