import React, { useState } from "react";
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { Snippet } from "../types";

interface SnippetFormProps {
  onSubmit: (snippet: Snippet) => void;
  onCancel: () => void;
}

const SnippetForm: React.FC<SnippetFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !command.trim()) {
      alert("全て入力してください");
      return;
    }

    onSubmit({ name: name.trim(), command: command.trim() });
    setName("");
    setCommand("");
  };

  return (
    <div className="form-container">
      <h3>新規登録フォーム</h3>
      <VSCodeTextField
        value={name}
        placeholder="スニペット名"
        className="form-textfield"
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
      />
      <VSCodeTextField
        value={command}
        placeholder="追加コマンド"
        className="form-textfield"
        onInput={(e) => setCommand((e.target as HTMLInputElement).value)}
      />
      <br />
      <div className="form-actions">
        <VSCodeButton onClick={handleSubmit}>登録</VSCodeButton>
        <VSCodeButton onClick={onCancel}>閉じる</VSCodeButton>
      </div>
    </div>
  );
};

export default SnippetForm;
