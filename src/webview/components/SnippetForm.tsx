import React, { useState } from "react";
import { TextField, Button } from "./common";
import { Snippet } from "../types";

interface SnippetFormProps {
  onSubmit: (snippet: Snippet) => void;
  onCancel: () => void;
}

const SnippetForm: React.FC<SnippetFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");

  const handleSubmit = () => {
    onSubmit({ id: crypto.randomUUID(), name: name.trim(), command: command.trim() });
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
