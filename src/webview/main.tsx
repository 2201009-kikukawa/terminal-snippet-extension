import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import { MeatballMenuProvider } from "./components/meatball/MeatballMenuContext";
import { Snippet } from "./types";
import { Button, Option } from "./components/common";
import "./styles.css";
import ChevronDownIcon from "../icons/ChevronDownIcon";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { snippets, addSnippet, deleteSnippet, runSnippet } = useSnippets();

  const handleDropdownToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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
      <div style={{ position: "relative" }}>
        <div className="add-button-container">
          <Button className="add-button" onClick={() => setShowForm(true)}>
            スニペットを追加する
          </Button>
          <div ref={dropdownRef}>
            <Button className="add-dropdown-button" onClick={handleDropdownToggle}>
              <ChevronDownIcon />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="add-dropdown-menu">
            {/* MEMO : オプションは一旦ダミーで実装 */}
            <Option onClick={() => {}}>オプション 1</Option>
            <Option onClick={() => {}}>別のオプション</Option>
          </div>
        )}
      </div>
      <SnippetList
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />
      {showForm && <SnippetForm onSubmit={handleAddSnippet} onCancel={() => setShowForm(false)} />}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
