import React, { useState } from "react";
import { TextField, Button } from "./common";
import { Group } from "../types"; // ★ typesからGroupをインポート

// ★ onSubmitの型を、idを含む完全なGroupオブジェクトを受け取るように変更
interface GroupFormProps {
  onSubmit: (group: Group) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ onSubmit, onCancel }) => {
  const [groupName, setGroupName] = useState("");

  const handleSubmit = () => {
    if (!groupName.trim()) return; 

    // ★ idを生成し、Groupオブジェクトを作成してonSubmitで渡す
    onSubmit({
      id: crypto.randomUUID(),
      groupName: groupName.trim(),
      snippets: [],
    });

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