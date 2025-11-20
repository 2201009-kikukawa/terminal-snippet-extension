import React, { useState, useEffect } from "react";
import { TextField, Button } from "./common";
import { Group } from "../types"; // ★ typesからGroupをインポート

interface GroupFormProps {
  onSubmit: (group: Group) => void;
  onUpdate: (group: Group) => void;
  onCancel: () => void;
  editingGroup: Group | null;
}

const GroupForm: React.FC<GroupFormProps> = ({
  onSubmit,
  onUpdate,
  onCancel,
  editingGroup,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");

  const isEditing = !!editingGroup;

  useEffect(() => {
    if (isEditing) {
      setGroupName(editingGroup.groupName);
    }
  }, [editingGroup, isEditing]);

  const handleSubmit = () => {
    const trimmedGroupName = groupName.trim();
    if (!trimmedGroupName) {
      setGroupNameError("グループ名を入力してください。");
      return;
    }

    if (isEditing) {
      onUpdate({
        ...editingGroup,
        groupName: trimmedGroupName,
      });
    } else {
      onSubmit({
        id: crypto.randomUUID(),
        groupName: trimmedGroupName,
        snippets: [],
      });
    }
    setGroupName("");
    setGroupNameError("");
  };

  return (
    <div>
      <div className="form-group">
        <TextField
          value={groupName}
          placeholder="グループ名"
          className="form-textfield"
          onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
        />
        {groupNameError && <p className="error-message">{groupNameError}</p>}
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

export default GroupForm;