import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import { MeatballMenuProvider } from "./components/meatball/MeatballMenuContext";
import { Snippet } from "./types";
import { Button } from "./components/common";
import "./styles.css";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { snippets, addSnippet, deleteSnippet, runSnippet } = useSnippets();

  const handleAddSnippet = (snippet: Snippet) => {
    addSnippet(snippet);
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
      <Button appearance="icon" onClick={() => setShowForm(true)}>
        <span className="add-button-icon">＋</span>
      </Button>{" "}
      {showForm && <SnippetForm onSubmit={handleAddSnippet} onCancel={() => setShowForm(false)} />}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
