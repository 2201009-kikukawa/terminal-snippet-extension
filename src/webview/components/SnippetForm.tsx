import React, { useState } from "react";
import { VSCodeLink, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { TextField, Button } from "./common";
import { Snippet, Group } from "../types";

interface SnippetFormProps {
  onSubmit: (snippet: Snippet, groupId?: string) => void;
  onCancel: () => void;
  groups: Group[];
}

const SnippetForm: React.FC<SnippetFormProps> = ({ onSubmit, onCancel, groups }) => {
  const [name, setName] = useState("");
  const [commands, setCommands] = useState<string[]>([""]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isEdit, setIsEdit] = useState(false); // ★ この行を追加

  const handleSubmit = () => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      name: name.trim(),
      command: commands.map((cmd) => cmd.trim()).filter((cmd) => cmd !== ""),
      isEdit: isEdit, // ★ この行を追加
    };
    
    if (newSnippet.name && newSnippet.command.length > 0) {
      onSubmit(newSnippet, selectedGroupId || undefined);
      // フォームの状態をリセット
      setName("");
      setCommands([""]);
      setSelectedGroupId("");
      setIsEdit(false); // ★ この行を追加
    }
  };

  // ★ コマンド入力欄を追加する関数
  const handleAddAnotherCommand = (e: React.MouseEvent) => {
    e.preventDefault();
    setCommands([...commands, ""]);
  };

  // ★ 特定のインデックスのコマンド内容を変更する関数
  const handleCommandChange = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  // ★ 特定のインデックスのコマンド入力欄を削除する関数
  const handleRemoveCommand = (index: number) => {
    if (commands.length > 1) {
      const newCommands = commands.filter((_, i) => i !== index);
      setCommands(newCommands);
    }
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
      {commands.map((command, index) => (
        <div key={index} className="command-input-container">
          <TextField
            value={command}
            placeholder={`実行コマンド ${index + 1}`}
            className="form-textfield"
            onInput={(e) => handleCommandChange(index, (e.target as HTMLInputElement).value)}
          />
          {commands.length > 1 && (
            <Button onClick={() => handleRemoveCommand(index)} appearance="icon" className="remove-command-button">
              ー
            </Button>
          )}
        </div>
      ))}

      {/* ▼▼▼【ここから追加】▼▼▼ */}
      <div className="form-check-container" style={{ margin: "2px 0" }}>
        <VSCodeCheckbox
          checked={isEdit}
          onChange={(e: any) => setIsEdit(e.target.checked)}
        >
          実行前に編集する
        </VSCodeCheckbox>
      </div>
      {/* ▲▲▲【ここまで追加】▲▲▲ */}

      <div className="add-command-link-container">
        <VSCodeLink href="#" onClick={handleAddAnotherCommand}>
          続けて実行するコマンドを追加
        </VSCodeLink>
      </div>

      <select
        value={selectedGroupId}
        onChange={(e) => setSelectedGroupId(e.target.value)}
        className="form-select"
      >
        <option value="">グループなし</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.groupName}
          </option>
        ))}
      </select>
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