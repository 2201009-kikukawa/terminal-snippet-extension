import React, { useState } from "react";
import { Snippet, Group } from "../types"; // ★ Group をインポート
import MeatballMenu from "./meatball/MeatballMenu";
import Button from "./common/Button";

// ▼ アコーディオンの開閉を示すシンプルなアイコン（お好みで変更してください）
const AccordionIcon = ({ isOpen }: { isOpen: boolean }) => (
  <span
    style={{
      display: "inline-block",
      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
      marginRight: "8px",
    }}>
    ▶
  </span>
);

// ▼ 繰り返し利用するため、単一のスニペット表示を別コンポーネントに切り出します
interface SnippetItemProps {
  snippet: Snippet;
  onRunSnippet: (command: string) => void;
  onEditSnippet: (snippet: Snippet) => void;
  onDeleteSnippet: (id: string) => void;
}

const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
}) => (
  <div className="snippet-item">
    <Button
      appearance="secondary"
      className="snippet-name-button"
      title={snippet.command}
      onClick={() => onRunSnippet(snippet.command)}>
      {snippet.name}
    </Button>
    <MeatballMenu
      id={`meatball-menu-${snippet.id}`}
      menuItems={[
        { label: "削除", onClick: () => onDeleteSnippet(snippet.id) },
        { label: "編集", onClick: () => onEditSnippet(snippet) }, // indexは不要なのでsnippetオブジェクト自体を渡す
      ]}
    />
  </div>
);


// ▼ SnippetList が受け取るPropsを更新
interface SnippetListProps {
  groups: Group[]; // グループの配列
  snippets: Snippet[]; // グループ化されていないスニペットの配列
  onRunSnippet: (command: string) => void;
  onEditSnippet: (snippet: Snippet) => void; // indexを使わない形に変更
  onDeleteSnippet: (id: string) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  groups,
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
}) => {
  // どのグループが開いているかをIDで管理するためのstate
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // グループの開閉を切り替える関数
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // 表示するものが何もない場合の表示
  if (groups.length === 0 && snippets.length === 0) {
    return <p>スニペットはまだありません</p>;
  }

  return (
    <div className="snippet-list">
      {/* --- グループのレンダリング --- */}
      {groups.map((group) => (
        <div key={group.id} className="group-container">
          <div className="group-header" onClick={() => toggleGroup(group.id)}>
            <AccordionIcon isOpen={!!openGroups[group.id]} />
            <span className="group-name">{group.groupName}</span>
          </div>
          {/* openGroups stateがtrueの場合のみ、中のスニペットを表示 */}
          {openGroups[group.id] && (
            <div className="group-snippets">
              {group.snippets.length > 0 ? (
                group.snippets.map((snippet) => (
                  <SnippetItem
                    key={snippet.id}
                    snippet={snippet}
                    onRunSnippet={onRunSnippet}
                    onEditSnippet={onEditSnippet}
                    onDeleteSnippet={onDeleteSnippet}
                  />
                ))
              ) : (
                <p className="no-snippets-in-group">このグループにスニペットはありません</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* --- グループ化されていないスニペットのレンダリング --- */}
      {snippets.map((snippet) => (
        <SnippetItem
          key={snippet.id}
          snippet={snippet}
          onRunSnippet={onRunSnippet}
          onEditSnippet={onEditSnippet}
          onDeleteSnippet={onDeleteSnippet}
        />
      ))}
    </div>
  );
};

export default SnippetList;