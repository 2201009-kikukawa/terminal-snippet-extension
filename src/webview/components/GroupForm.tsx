import React, { useState } from "react";
import { TextField, Button } from "./common";
import { Group } from "../types";

interface GroupFormProps {
  onSubmit: (group: Omit<Group, 'snippets'> & { snippets: [] }) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ onSubmit, onCancel }) => {
  console.log("GroupFormがレンダリングされました"); // ← この行を追加
  const [groupName, setGroupName] = useState("");

  const handleSubmit = () => {
    if (!groupName.trim()) return; // グループ名が空の場合は何もしない
    onSubmit({ groupName: groupName.trim(), snippets: [] });
    setGroupName("");
  };

  return (
    <div className="form-container">
      <h3>新規グループ作成</h3>
      <TextField
        value={groupName}
        placeholder="グループ名"
        className="form-textfield"
        onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
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

export default GroupForm;