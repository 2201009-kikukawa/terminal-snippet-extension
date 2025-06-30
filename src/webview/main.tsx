import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useSnippets } from "./hooks";
import { SnippetList, SnippetForm, MeatballMenuProvider } from "./components";
import { Snippet } from "./types";
import "./styles.css";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { snippets, addSnippet, deleteSnippet, runSnippet } = useSnippets();

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
    <MeatballMenuProvider>
      <SnippetList
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />
      <VSCodeButton appearance="icon" onClick={() => setShowForm(true)}>
        <span className="add-button-icon">＋</span>
      </VSCodeButton>{" "}
      {showForm && <SnippetForm onSubmit={handleAddSnippet} onCancel={() => setShowForm(false)} />}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
