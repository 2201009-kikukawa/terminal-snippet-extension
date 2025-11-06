import React, { useState, useRef, useEffect } from "react";
import { Snippet, Group } from "../types";
import Button from "./common/Button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DragHandleIcon from "../../icons/DragHandleIcon";

// main.tsxでインポートするためにexportする
export const AccordionIcon = ({ isOpen }: { isOpen: boolean }) => (
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

// ▼▼▼【ここから変更】▼▼▼
interface SnippetItemProps {
  snippet: Snippet;
  onRunSnippet: (snippet: Snippet) => void;
  onEditSnippet: (snippet: Snippet, groupId?: string) => void;
  onDeleteSnippet: (id: string) => void;
  groupId?: string;
  dragAttributes?: ReturnType<typeof useSortable>["attributes"];
  dragListeners?: ReturnType<typeof useSortable>["listeners"];
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
}

export const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  groupId,
  dragAttributes,
  dragListeners,
  isMenuOpen,
  onMenuToggle,
}) => {
  return (
    <div className="snippet-item">
      <div className="drag-handle-container">
        <DragHandleIcon
          className="drag-handle"
          onHandleClick={onMenuToggle}
          {...dragAttributes}
          {...dragListeners}
        />
        {isMenuOpen && (
          <div className="context-menu">
            <div
              className="context-menu-item"
              onClick={() => onEditSnippet(snippet, groupId)}>
              編集
            </div>
            <div
              className="context-menu-item"
              onClick={() => onDeleteSnippet(snippet.id)}>
              削除
            </div>
          </div>
        )}
      </div>
      <Button
        appearance="secondary"
        className="snippet-name-button"
        title={snippet.command.join(" && ")}
        onClick={() => onRunSnippet(snippet)}>
        {snippet.name}
      </Button>
      {/* MeatballMenuコンポーネントはここから削除 */}
    </div>
  );
};
// ▲▲▲【ここまで変更】▲▲▲

// propsからdrag関連の型を除外
const SortableSnippetItem: React.FC<Omit<SnippetItemProps, "dragAttributes" | "dragListeners">> = (
  props
) => {
  // isDragging を受け取る
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.snippet.id,
    data: {
      type: "snippet",
      groupId: props.groupId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // ドラッグ中は半透明にする
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    // ラッパーdivにdnd-kitのrefとstyleを適用
    <div ref={setNodeRef} style={style}>
      <SnippetItem
        {...props}
        dragAttributes={attributes} // drag関連のpropsをSnippetItemに渡す
        dragListeners={listeners}
      />
    </div>
  );
};

interface SnippetListProps {
  groups: Group[];
  snippets: Snippet[];
  onRunSnippet: (snippet: Snippet) => void;
  onEditSnippet: (snippet: Snippet, groupId?: string) => void;
  onDeleteSnippet: (id: string) => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
}

// ▼▼▼【ここから変更】▼▼▼
const SnippetList: React.FC<SnippetListProps> = ({
  groups,
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  onEditGroup,
  onDeleteGroup,
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  const handleMenuToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(prevId => (prevId === id ? null : id));
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // メニューの外側をクリックしたときにメニューを閉じる
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ▼▼▼【ここから追加】▼▼▼
  const handleEditSnippetClick = (snippet: Snippet, groupId?: string) => {
    onEditSnippet(snippet, groupId); // 1. 元の編集関数を呼び出す
    setActiveMenuId(null); // 2. メニューを閉じる
  };

  const handleEditGroupClick = (group: Group) => {
    onEditGroup(group); // 1. 元の編集関数を呼び出す
    setActiveMenuId(null); // 2. メニューを閉じる
  };
  // ▲▲▲【ここまで追加】▲▲▲

  if (groups.length === 0 && snippets.length === 0) {
    return <p>スニペットはまだありません</p>;
  }

  return (
    <div className="snippet-list" ref={menuRef}>
      <SortableContext
        items={groups.map((g) => g.id)}
        strategy={verticalListSortingStrategy}>
        {groups.map((group) => (
          <SortableGroup
            key={group.id}
            group={group}
            isOpen={!!openGroups[group.id]}
            onToggle={toggleGroup}
            onRunSnippet={onRunSnippet}
            onEditSnippet={handleEditSnippetClick} // 変更
            onDeleteSnippet={onDeleteSnippet}
            onEditGroup={handleEditGroupClick} // 変更
            onDeleteGroup={onDeleteGroup}
            isMenuOpen={activeMenuId === group.id}
            onMenuToggle={(e) => handleMenuToggle(group.id, e)}
            // ▼▼▼【ここから追加】▼▼▼
            activeMenuId={activeMenuId}
            handleMenuToggle={handleMenuToggle}
            // ▲▲▲【ここまで追加】▲▲▲
          />
        ))}
      </SortableContext>

      <SortableContext
        items={snippets.map((s) => s.id)}
        strategy={verticalListSortingStrategy}>
        {snippets.map((snippet) => (
          <SortableSnippetItem
            key={snippet.id}
            snippet={snippet}
            onRunSnippet={onRunSnippet}
            onEditSnippet={handleEditSnippetClick} // 変更
            onDeleteSnippet={onDeleteSnippet}
            isMenuOpen={activeMenuId === snippet.id}
            onMenuToggle={(e) => handleMenuToggle(snippet.id, e)}
          />
        ))}
      </SortableContext>
    </div>
  );
};
// ▲▲▲【ここまで変更】▲▲▲

// ▼▼▼【ここから変更】▼▼▼
interface SortableGroupProps {
  group: Group;
  isOpen: boolean;
  onToggle: (groupId: string) => void;
  onRunSnippet: (snippet: Snippet) => void;
  onEditSnippet: (snippet: Snippet, groupId?: string) => void;
  onDeleteSnippet: (id: string) => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  // ▼▼▼【ここから追加】▼▼▼
  activeMenuId: string | null;
  handleMenuToggle: (id: string, e: React.MouseEvent) => void;
  // ▲▲▲【ここまで追加】▲▲▲
}

const SortableGroup: React.FC<SortableGroupProps> = ({
  group,
  isOpen,
  onToggle,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  onEditGroup,
  onDeleteGroup,
  isMenuOpen,
  onMenuToggle,
  // ▼▼▼【ここから追加】▼▼▼
  activeMenuId,
  handleMenuToggle,
  // ▲▲▲【ここまで追加】▲▲▲
}) => {
// ▲▲▲【ここまで変更】▲▲▲
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: group.id,
      data: {
        type: "group",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group-container">
      <div className="group-header" onClick={() => onToggle(group.id)}>
        <div className="drag-handle-container">
          <DragHandleIcon
            className="drag-handle"
            onHandleClick={onMenuToggle}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          />
          {isMenuOpen && (
            <div className="context-menu" onClick={(e) => e.stopPropagation()}>
              <div
                className="context-menu-item"
                onClick={() => onEditGroup(group)}>
                編集
              </div>
              <div
                className="context-menu-item"
                onClick={() => onDeleteGroup(group.id)}>
                削除
              </div>
            </div>
          )}
        </div>
        <AccordionIcon isOpen={isOpen} />
        <span className="group-name">{group.groupName}</span>
        {/* MeatballMenuのコンテナはここから削除 */}
      </div>
      {isOpen && (
        <div className="group-snippets">
          <SortableContext
            items={group.snippets.map((s) => s.id)}
            strategy={verticalListSortingStrategy}>
            {group.snippets.length > 0 ? (
              group.snippets.map((snippet) => (
                <SortableSnippetItem
                  key={snippet.id}
                  snippet={snippet}
                  onRunSnippet={onRunSnippet}
                  onEditSnippet={onEditSnippet}
                  onDeleteSnippet={onDeleteSnippet}
                  groupId={group.id}
                  // ▼▼▼【ここから変更】▼▼▼
                  isMenuOpen={activeMenuId === snippet.id}
                  onMenuToggle={(e) => handleMenuToggle(snippet.id, e)}
                  // ▲▲▲【ここまで変更】▲▲▲
                />
              ))
            ) : (
              <p className="no-snippets-in-group">
                このグループにスニペットはありません
              </p>
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
// ▲▲▲【ここまで変更】▲▲▲

export default SnippetList;
