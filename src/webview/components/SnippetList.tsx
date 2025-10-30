import React, { useState } from "react";
import { Snippet, Group } from "../types";
import MeatballMenu from "./meatball/MeatballMenu";
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
    }}
  >
    ▶
  </span>
);

interface SnippetItemProps {
  snippet: Snippet;
  onRunSnippet: (snippet: Snippet) => void;
  onEditSnippet: (snippet: Snippet, groupId?: string) => void;
  onDeleteSnippet: (id: string) => void;
  groupId?: string;
  // dnd-kitのリスナーと属性をpropsとして受け取る
  dragAttributes?: ReturnType<typeof useSortable>["attributes"];
  dragListeners?: ReturnType<typeof useSortable>["listeners"];
}

// main.tsxでインポートするためにexportする
export const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  groupId,
  dragAttributes,
  dragListeners,
}) => (
  <div className="snippet-item">
    <DragHandleIcon
      className="drag-handle"
      {...dragAttributes}
      {...dragListeners}
    />
    <Button
      appearance="secondary"
      className="snippet-name-button"
      title={snippet.command.join(" && ")}
      onClick={() => onRunSnippet(snippet)}
    >
      {snippet.name}
    </Button>
    <MeatballMenu
      id={`meatball-menu-${snippet.id}`}
      menuItems={[
        { label: "編集", onClick: () => onEditSnippet(snippet, groupId) },
        { label: "削除", onClick: () => onDeleteSnippet(snippet.id) },
      ]}
    />
  </div>
);

// propsからdrag関連の型を除外
const SortableSnippetItem: React.FC<
  Omit<SnippetItemProps, "dragAttributes" | "dragListeners">
> = (props) => {
  // isDragging を受け取る
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
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
  // ▼▼▼【ここから追加】▼▼▼
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  // ▲▲▲【ここまで追加】▲▲▲
}

const SnippetList: React.FC<SnippetListProps> = ({
  groups,
  snippets,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  // ▼▼▼【ここから追加】▼▼▼
  onEditGroup,
  onDeleteGroup,
  // ▲▲▲【ここまで追加】▲▲▲
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (groups.length === 0 && snippets.length === 0) {
    return <p>スニペットはまだありません</p>;
  }

  return (
    <div className="snippet-list">
      {/* --- グループのレンダリング --- */}
      <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        {groups.map((group) => (
          <SortableGroup
            key={group.id}
            group={group}
            isOpen={!!openGroups[group.id]}
            onToggle={toggleGroup}
            onRunSnippet={onRunSnippet}
            onEditSnippet={onEditSnippet}
            onDeleteSnippet={onDeleteSnippet}
            // ▼▼▼【ここから追加】▼▼▼
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            // ▲▲▲【ここまで追加】▲▲▲
          />
        ))}
      </SortableContext>

      {/* --- グループ化されていないスニペットのレンダリング --- */}
      <SortableContext items={snippets.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {snippets.map((snippet) => (
          <SortableSnippetItem
            key={snippet.id}
            snippet={snippet}
            onRunSnippet={onRunSnippet}
            onEditSnippet={onEditSnippet}
            onDeleteSnippet={onDeleteSnippet}
          />
        ))}
      </SortableContext>
    </div>
  );
};

// グループをDraggableにするためのコンポーネント
interface SortableGroupProps {
  group: Group;
  isOpen: boolean;
  onToggle: (groupId: string) => void;
  onRunSnippet: (snippet: Snippet) => void;
  onEditSnippet: (snippet: Snippet, groupId?: string) => void;
  onDeleteSnippet: (id: string) => void;
  // ▼▼▼【ここから追加】▼▼▼
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  // ▲▲▲【ここまで追加】▲▲▲
}

const SortableGroup: React.FC<SortableGroupProps> = ({
  group,
  isOpen,
  onToggle,
  onRunSnippet,
  onEditSnippet,
  onDeleteSnippet,
  // ▼▼▼【ここから追加】▼▼▼
  onEditGroup,
  onDeleteGroup,
  // ▲▲▲【ここまで追加】▲▲▲
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: "group",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // ドラッグ中は半透明にする
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group-container">
      {/* onClickはヘッダー全体に残し、ドラッグリスナーはハンドルに限定 */}
      <div className="group-header" onClick={() => onToggle(group.id)}>
        <DragHandleIcon
          className="drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()} // ヘッダーのonClickが発火しないようにする
        />
        <AccordionIcon isOpen={isOpen} />
        <span className="group-name">{group.groupName}</span>
        {/* ▼▼▼【ここから追加】▼▼▼ */}
        <div className="meatball-menu-container" onClick={(e) => e.stopPropagation()}>
          <MeatballMenu
            id={`meatball-menu-group-${group.id}`}
            menuItems={[
              { label: "編集", onClick: () => onEditGroup(group) },
              { label: "削除", onClick: () => onDeleteGroup(group.id) },
            ]}
          />
        </div>
        {/* ▲▲▲【ここまで追加】▲▲▲ */}
      </div>
      {isOpen && (
        <div className="group-snippets">
          {/* グループ内スニペットをSortableにする */}
          <SortableContext items={group.snippets.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {group.snippets.length > 0 ? (
              group.snippets.map((snippet) => (
                <SortableSnippetItem
                  key={snippet.id}
                  snippet={snippet}
                  onRunSnippet={onRunSnippet}
                  onEditSnippet={onEditSnippet}
                  onDeleteSnippet={onDeleteSnippet}
                  groupId={group.id}
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

export default SnippetList;