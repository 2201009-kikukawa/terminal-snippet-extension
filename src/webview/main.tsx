import React, { useEffect, useRef, useState, useMemo } from "react"; // ◀◀◀【ここを修正】
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import GroupForm from "./components/GroupForm";
import { MeatballMenuProvider } from "./components/meatball/MeatballMenuContext";
import { Snippet, Group } from "./types";
import { Button, Option, TextField } from "./components/common"; // ◀◀◀【ここを修正】
import "./styles.css";
import ChevronDownIcon from "../icons/ChevronDownIcon";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ▼▼▼【ここから追加】▼▼▼
  const [searchTerm, setSearchTerm] = useState("");
  // ▲▲▲【ここまで追加】▲▲▲
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { snippets, groups, addSnippet, addGroup, deleteSnippet, runSnippet, updateSnippet } = useSnippets();
  const [editingContext, setEditingContext] = useState<{ snippet: Snippet; groupId?: string } | null>(
    null
  );

  // ▼▼▼【ここから追加】▼▼▼
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return { filteredSnippets: snippets, filteredGroups: groups };
    }

    const lowercasedFilter = searchTerm.toLowerCase();

    const snippetFilter = (snippet: Snippet) =>
      snippet.name.toLowerCase().includes(lowercasedFilter) ||
      snippet.command.some((cmd) => cmd.toLowerCase().includes(lowercasedFilter));

    const filteredSnippets = snippets.filter(snippetFilter);

    const filteredGroups = groups
      .map((group) => {
        const matchingSnippets = group.snippets.filter(snippetFilter);
        if (matchingSnippets.length > 0) {
          return { ...group, snippets: matchingSnippets };
        }
        return null;
      })
      .filter((group): group is Group => group !== null);

    return { filteredSnippets, filteredGroups };
  }, [searchTerm, snippets, groups]);
  // ▲▲▲【ここまで追加】▲▲▲

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

      {/* ▼▼▼【ここから追加】▼▼▼ */}
      <div className="search-bar-container">
        <TextField
          // ▼▼▼【ここを修正】▼▼▼
          placeholder="検索"
          // ▲▲▲【ここまで修正】▲▲▲
          value={searchTerm}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {/* ▲▲▲【ここまで追加】▲▲▲ */}

      <SnippetList
        // ▼▼▼【ここを修正】▼▼▼
        groups={filteredData.filteredGroups}
        snippets={filteredData.filteredSnippets}
        // ▲▲▲【ここまで修正】▲▲▲
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />

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
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
