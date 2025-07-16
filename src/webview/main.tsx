import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import GroupForm from "./components/GroupForm"; // ★ 追加
import { MeatballMenuProvider } from "./components/meatball/MeatballMenuContext";
import { Snippet, Group } from "./types"; // ★ Group を追加
import { Button, Option } from "./components/common";
import "./styles.css";
import ChevronDownIcon from "../icons/ChevronDownIcon";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false); // ★ 追加
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { snippets, addSnippet, deleteSnippet, runSnippet, addGroup } = useSnippets(); // ★ addGroup を追加

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

  // ★ 以下を追加
  const handleAddGroup = (group: Omit<Group, 'snippets'> & { snippets: [] }) => {
    addGroup(group);
    setShowGroupForm(false);
  };

  const handleDeleteSnippet = (id: string) => {
    deleteSnippet(id);
  };

  const handleEditSnippet = (snippet: Snippet, index: number) => {
    // 編集機能は後で実装
    // handleDeleteSnippet(snippet);
  };

  return (
    <MeatballMenuProvider>
      {/* 1. ボタンとメニューを囲む親divを作成し、refをここに設定 */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div className="add-button-container">
          <Button className="add-button" onClick={() => setShowForm(true)}>
            スニペットを追加する
          </Button>
          {/* 2. ref={dropdownRef} は親に移動したので、ここのdivは不要 */}
          <Button className="add-dropdown-button" onClick={handleDropdownToggle}>
            <ChevronDownIcon />
          </Button>
        </div>

        {isMenuOpen && (
          <div className="add-dropdown-menu">
            {/* テスト用にdivに戻しておきます。動作確認後にOptionコンポーネントに再度修正してください */}
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
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />
      {showForm && <SnippetForm onSubmit={handleAddSnippet} onCancel={() => setShowForm(false)} />}
      {/* ★ 以下を追加 */}
      {showGroupForm && <GroupForm onSubmit={handleAddGroup} onCancel={() => setShowGroupForm(false)} />}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
