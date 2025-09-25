import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import GroupForm from "./components/GroupForm";
import { MeatballMenuProvider } from "./components/meatball/MeatballMenuContext";
import { Snippet, Group } from "./types";
import { Button, Option } from "./components/common";
import "./styles.css";
import ChevronDownIcon from "../icons/ChevronDownIcon";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // ▼▼▼【ここを修正】▼▼▼
  const { snippets, groups, addSnippet, addGroup, deleteSnippet, runSnippet, updateSnippet } = useSnippets();
  const [editingContext, setEditingContext] = useState<{ snippet: Snippet; groupId?: string } | null>(
    null
  );
  // ▲▲▲【ここまで修正】▲▲▲

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

  const handleAddSnippet = (snippet: Snippet, groupId?: string) => {
    addSnippet(snippet, groupId);
    setShowForm(false);
  };

  const handleAddGroup = (group: Group) => {
    addGroup(group);
    setShowGroupForm(false);
  };

  const handleDeleteSnippet = (id: string) => {
    deleteSnippet(id);
  };

  // ▼▼▼【ここから修正】▼▼▼
  const handleEditSnippet = (snippet: Snippet, groupId?: string) => {
    setEditingContext({ snippet, groupId });
  };

  const handleUpdateSnippet = (snippet: Snippet, groupId?: string) => {
    updateSnippet(snippet, groupId);
    setEditingContext(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setShowGroupForm(false);
    setEditingContext(null);
  };
  // ▲▲▲【ここまで修正】▲▲▲

  return (
    <MeatballMenuProvider>
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div className="add-button-container">
          <Button className="add-button" onClick={() => setShowForm(true)}>
            スニペットを追加する
          </Button>
          <Button className="add-dropdown-button" onClick={handleDropdownToggle}>
            <ChevronDownIcon />
          </Button>
        </div>

        {isMenuOpen && (
          <div className="add-dropdown-menu">
            <Option
              onClick={() => {
                setShowGroupForm(true);
                setIsMenuOpen(false);
              }}
            >
              グループを追加
            </Option>
          </div>
        )}
      </div>

      <SnippetList
        groups={groups}
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />

      {/* ▼▼▼【ここを修正】▼▼▼ */}
      {(showForm || editingContext) && !showGroupForm && (
        <SnippetForm
          onSubmit={handleAddSnippet}
          onUpdate={handleUpdateSnippet}
          onCancel={handleCancelForm}
          groups={groups}
          editingContext={editingContext}
        />
      )}

      {showGroupForm && (
        <GroupForm onSubmit={handleAddGroup} onCancel={handleCancelForm} />
      )}
      {/* ▲▲▲【ここまで修正】▲▲▲ */}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
