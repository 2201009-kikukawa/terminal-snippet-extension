import React, { useState, useEffect } from "react";
import { VSCodeLink, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { TextField, Button } from "./common";
import { Snippet, Group } from "../types";

interface SnippetFormProps {
  onSubmit: (snippet: Snippet, groupId?: string) => void;
  onUpdate: (snippet: Snippet, groupId?: string) => void;
  onCancel: () => void;
  groups: Group[];
  editingContext: { snippet: Snippet; groupId?: string } | null;
}

const SnippetForm: React.FC<SnippetFormProps> = ({
  onSubmit, 
  onUpdate,
  onCancel,
  groups,
  editingContext,
}) => {
  const [name, setName] = useState("");
  const [commands, setCommands] = useState<string[]>([""]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isEdit, setIsEdit] = useState(false);

  // ▼▼▼【ここから追加】▼▼▼
  const [nameError, setNameError] = useState("");
  const [commandError, setCommandError] = useState("");
  // ▲▲▲【ここまで追加】▲▲▲

  const isEditing = !!editingContext;

  useEffect(() => {
    if (isEditing) {
      const { snippet, groupId } = editingContext;
      setName(snippet.name);
      setCommands(snippet.command.length > 0 ? snippet.command : [""]);
      setIsEdit(snippet.isEdit);
      setSelectedGroupId(groupId || "");
    }
  }, [editingContext, isEditing]);

  const handleSubmit = () => {
    // ▼▼▼【ここから修正】▼▼▼
    // バリデーションエラーをリセット
    setNameError("");
    setCommandError("");

    const trimmedName = name.trim();
    const nonEmptyCommands = commands.map((cmd) => cmd.trim()).filter((cmd) => cmd !== "");

    // バリデーションチェック
    let hasError = false;
    if (!trimmedName) {
      setNameError("名前を入力してください。");
      hasError = true;
    }
    if (nonEmptyCommands.length === 0) {
      setCommandError("コマンドを1つ以上入力してください。");
      hasError = true;
    }

    if (hasError) {
      return; // エラーがあればここで処理を中断
    }

    const snippetData: Snippet = {
      id: isEditing ? editingContext.snippet.id : crypto.randomUUID(),
      name: trimmedName,
      command: nonEmptyCommands,
      isEdit: isEdit,
    };

    if (isEditing) {
      onUpdate(snippetData, selectedGroupId || undefined);
    } else {
      onSubmit(snippetData, selectedGroupId || undefined);
    }
    // ▲▲▲【ここまで修正】▲▲▲
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
      <h3>{isEditing ? "編集フォーム" : "新規登録フォーム"}</h3>
      {/* ▼▼▼【ここから修正】▼▼▼ */}
      <div className="form-group">
        <label>
          名前
        </label>
        <TextField
          value={name}
          placeholder="スニペット名"
          className="form-textfield"
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
        />
        {nameError && <p className="error-message">{nameError}</p>}
      </div>

      <div className="form-group">
        <label>
          コマンド
        </label>
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
        {commandError && <p className="error-message">{commandError}</p>}
      </div>
      {/* ▲▲▲【ここまで修正】▲▲▲ */}

    <div className="form-group">
      <div className="form-check-container" style={{ margin: "2px 0" }}>
        <VSCodeCheckbox
          checked={isEdit}
          onChange={(e: any) => setIsEdit(e.target.checked)}
        >
          実行前に編集する
        </VSCodeCheckbox>
      </div>

      <div className="add-command-link-container">
        <VSCodeLink href="#" onClick={handleAddAnotherCommand}>
          続けて実行するコマンドを追加
        </VSCodeLink>
      </div>
    </div>

    <div className="form-group">
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
    </div>

      <div className="form-actions">
        <Button onClick={handleSubmit}>{isEditing ? "更新" : "登録"}</Button>
        <Button onClick={onCancel} appearance="secondary">
          {isEditing ? "戻る" : "閉じる"}
        </Button>
      </div>
    </div>
  );
};

export default SnippetForm;