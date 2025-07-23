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
  // ★ useSnippets から groups も取得
  const { snippets, groups, addSnippet, deleteSnippet, runSnippet, addGroup } = useSnippets();

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

  // ★ handleAddSnippet を groupId を受け取れるように変更
  const handleAddSnippet = (snippet: Snippet, groupId?: string) => {
    addSnippet(snippet, groupId);
    setShowForm(false);
  };

  // ★ handleAddGroup の型を更新
  const handleAddGroup = (group: Group) => {
    addGroup(group);
    setShowGroupForm(false);
  };

  const handleDeleteSnippet = (id: string) => {
    deleteSnippet(id);
  };

  // ▼ handleEditSnippet の引数を (snippet, index) から (snippet) に変更
  const handleEditSnippet = (snippet: Snippet) => {
    // 編集機能は後で実装
    console.log("Editing snippet:", snippet);
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
      {/* ▼ SnippetList に groups と snippets の両方を渡す */}
      <SnippetList
        groups={groups}
        snippets={snippets}
        onRunSnippet={runSnippet}
        onEditSnippet={handleEditSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />
      {/* ★ SnippetForm に groups を渡す */}
      {showForm && (
        <SnippetForm
          onSubmit={handleAddSnippet}
          onCancel={() => setShowForm(false)}
          groups={groups}
        />
      )}
      {showGroupForm && <GroupForm onSubmit={handleAddGroup} onCancel={() => setShowGroupForm(false)} />}
    </MeatballMenuProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
