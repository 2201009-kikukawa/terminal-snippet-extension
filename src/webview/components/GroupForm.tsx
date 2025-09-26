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
  // ▼▼▼【ここから追加】▼▼▼
  const [groupNameError, setGroupNameError] = useState("");
  // ▲▲▲【ここまで追加】▲▲▲

  const handleSubmit = () => {
    // ▼▼▼【ここから修正】▼▼▼
    const trimmedGroupName = groupName.trim();

    // バリデーションチェック
    if (!trimmedGroupName) {
      setGroupNameError("グループ名を入力してください。");
      return; // 空の場合はここで処理を中断
    }

    // エラーがなければ送信
    onSubmit({
      id: crypto.randomUUID(),
      groupName: trimmedGroupName,
      snippets: [],
    });

    setGroupName("");
    setGroupNameError(""); // 送信成功時にエラーメッセージをクリア
    // ▲▲▲【ここまで修正】▲▲▲
  };

  return (
    <div className="form-container">
      <h3>新規グループ作成</h3>
      {/* ▼▼▼【ここから修正】▼▼▼ */}
      <div className="form-group">
        <TextField
          value={groupName}
          placeholder="グループ名"
          className="form-textfield"
          onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
        />
        {groupNameError && <p className="error-message">{groupNameError}</p>}
      </div>
      {/* ▲▲▲【ここまで修正】▲▲▲ */}
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