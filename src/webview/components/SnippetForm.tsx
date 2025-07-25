import React, { useState } from "react";
import { TextField, Button } from "./common";
import { Snippet, Group } from "../types"; // ★ Group をインポート

interface SnippetFormProps {
  // ★ onSubmit の型を groupId を受け取れるように変更
  onSubmit: (snippet: Snippet, groupId?: string) => void;
  onCancel: () => void;
  groups: Group[]; // ★ groups を props で受け取る
}

const SnippetForm: React.FC<SnippetFormProps> = ({ onSubmit, onCancel, groups }) => {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // ★ 選択されたグループIDを管理

  const handleSubmit = () => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      name: name.trim(),
      command: command.trim(),
    };
    // ★ selectedGroupId が空文字列でなければそれを、そうでなければ undefined を渡す
    onSubmit(newSnippet, selectedGroupId || undefined);
    setName("");
    setCommand("");
  };

  return (
    <div className="form-container">
      <h3>新規登録フォーム</h3>
      <TextField
        value={name}
        placeholder="スニペット名"
        className="form-textfield"
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
      />
      <TextField
        value={command}
        placeholder="追加コマンド"
        className="form-textfield"
        onInput={(e) => setCommand((e.target as HTMLInputElement).value)}
      />
      {/* ★ ここからグループ選択のセレクトボックスを追加 */}
      <select
        value={selectedGroupId}
        onChange={(e) => setSelectedGroupId(e.target.value)}
        className="form-select" // CSSは別途調整してください
      >
        <option value="">グループなし</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.groupName}
          </option>
        ))}
      </select>
      {/* ★ ここまで追加 */}
      <div className="form-actions">
        <Button onClick={handleSubmit}>登録</Button>
        <Button onClick={onCancel} appearance="secondary">
          閉じる
        </Button>
      </div>
    </div>
  );
};

export default SnippetForm;
