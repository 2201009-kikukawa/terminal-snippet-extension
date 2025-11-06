import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { useSnippets } from "./hooks";
import SnippetList from "./components/SnippetList";
import SnippetForm from "./components/SnippetForm";
import GroupForm from "./components/GroupForm";
import { Snippet, Group } from "./types";
import { Button, Option, TextField } from "./components/common";
import "./styles.css";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
// SnippetList から SnippetItem と AccordionIcon をインポート
import { SnippetItem, AccordionIcon } from "./components/SnippetList";
import DragHandleIcon from "../icons/DragHandleIcon";

const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    snippets,
    groups,
    setSnippets, // hooksからset関数を受け取る
    setGroups, // hooksからset関数を受け取る
    addSnippet,
    addGroup,
    deleteSnippet,
    runSnippet,
    updateSnippet,
    updateOrder, // hooksから関数を受け取る
    updateGroup,
    deleteGroup,
  } = useSnippets();

  const [editingContext, setEditingContext] = useState<{
    snippet: Snippet;
    groupId?: string;
  } | null>(null);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // ドラッグ中のアイテムを保持するstate
  const [activeItem, setActiveItem] = useState<Snippet | Group | null>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return { filteredSnippets: snippets, filteredGroups: groups };
    }

    const lowercasedFilter = searchTerm.toLowerCase();

    const snippetFilter = (snippet: Snippet) =>
      snippet.name.toLowerCase().includes(lowercasedFilter) ||
      snippet.command.some((cmd) => cmd.toLowerCase().includes(lowercasedFilter));

    const filteredSnippets = snippets.filter(snippetFilter);

    const filteredGroups = groups
      .map((group) => {
        const matchingSnippets = group.snippets.filter(snippetFilter);

        if (matchingSnippets.length > 0) {
          return { ...group, snippets: matchingSnippets };
        }
        return null;
      })
      .filter((group): group is Group => group !== null);

    return { filteredSnippets, filteredGroups };
  }, [searchTerm, snippets, groups]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動してからドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ開始時の処理
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    const type = active.data.current?.type;
    const groupId = active.data.current?.groupId;

    if (type === "group") {
      setActiveItem(groups.find((g) => g.id === activeId) || null);
    } else if (type === "snippet") {
      let foundSnippet: Snippet | undefined;
      if (groupId) {
        const group = groups.find((g) => g.id === groupId);
        foundSnippet = group?.snippets.find((s) => s.id === activeId);
      } else {
        foundSnippet = snippets.find((s) => s.id === activeId);
      }
      setActiveItem(foundSnippet || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // ドラッグ中のアイテムをリセット
    setActiveItem(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // active.data.currentから種別と所属グループIDを取得
    const type = active.data.current?.type;
    const fromGroupId = active.data.current?.groupId;

    // over.data.currentから所属グループIDを取得 (ドロップ先がグループの場合)
    const toGroupId = over.data.current?.groupId;
    const overType = over.data.current?.type;

    let newGroups = [...groups];
    let newSnippets = [...snippets];

    // --- グループ自体の並び替え ---
    if (type === "group" && overType === "group") {
      const oldIndex = newGroups.findIndex((g) => g.id === activeId);
      const newIndex = newGroups.findIndex((g) => g.id === overId);
      newGroups = arrayMove(newGroups, oldIndex, newIndex);
    }
    // --- スニペットの並び替え ---
    else if (type === "snippet") {
      // 同じグループ内での移動
      if (fromGroupId && fromGroupId === toGroupId) {
        const groupIndex = newGroups.findIndex((g) => g.id === fromGroupId);
        if (groupIndex > -1) {
          const oldSnippetIndex = newGroups[groupIndex].snippets.findIndex(
            (s) => s.id === activeId
          );
          const newSnippetIndex = newGroups[groupIndex].snippets.findIndex((s) => s.id === overId);
          newGroups[groupIndex].snippets = arrayMove(
            newGroups[groupIndex].snippets,
            oldSnippetIndex,
            newSnippetIndex
          );
        }
      }
      // グループ化されていないスニペット同士の移動
      else if (!fromGroupId && !toGroupId) {
        const oldSnippetIndex = newSnippets.findIndex((s) => s.id === activeId);
        const newSnippetIndex = newSnippets.findIndex((s) => s.id === overId);
        newSnippets = arrayMove(newSnippets, oldSnippetIndex, newSnippetIndex);
      }
    }

    setGroups(newGroups);
    setSnippets(newSnippets);
    updateOrder(newSnippets, newGroups); // 変更をバックエンドに通知
  };

  const handleDropdownToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAddSnippet = (snippet: Snippet, groupId?: string) => {
    addSnippet(snippet, groupId);
    setShowForm(false);
  };

  const handleAddGroup = (group: Group) => {
    addGroup(group);
    setShowGroupForm(false);
  };

  const handleDeleteSnippet = (id: string) => {
    // ▼▼▼【ここから追加】▼▼▼
    // もし削除対象が編集中のスニペットなら、編集フォームを閉じる
    if (editingContext && editingContext.snippet.id === id) {
      setEditingContext(null);
    }
    // ▲▲▲【ここまで追加】▲▲▲
    deleteSnippet(id);
  };

  const handleEditSnippet = (snippet: Snippet, groupId?: string) => {
    setEditingContext({ snippet, groupId });
  };

  const handleUpdateSnippet = (snippet: Snippet, groupId?: string) => {
    updateSnippet(snippet, groupId);
    setEditingContext(null);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  const handleUpdateGroup = (group: Group) => {
    updateGroup(group);
    setEditingGroup(null);
    setShowGroupForm(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    // ユーザーに確認を求める場合は、ここに confirm ダイアログなどを追加できます。
    // ▼▼▼【ここから追加】▼▼▼
    // もし削除対象が編集中のグループなら、編集フォームを閉じる
    if (editingGroup && editingGroup.id === groupId) {
      setEditingGroup(null);
      setShowGroupForm(false);
    }
    // ▲▲▲【ここまで追加】▲▲▲
    deleteGroup(groupId);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setShowGroupForm(false);
    setEditingContext(null);
    setEditingGroup(null);
  };

  return (
    <div>
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div className="add-button-container">
          <Button className="add-button" onClick={() => setShowForm(true)}>
            スニペットを追加する
          </Button>
          <Button className="add-dropdown-button" onClick={handleDropdownToggle}>
            <ChevronDownIcon />
          </Button>
        </div>

        {isMenuOpen && (
          <div className="add-dropdown-menu">
            <Option
              onClick={() => {
                setShowGroupForm(true);
                setIsMenuOpen(false);
              }}>
              グループを追加
            </Option>
          </div>
        )}
      </div>

      <div className="search-bar-container">
        <TextField
          placeholder="検索"
          value={searchTerm}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveItem(null)}
        modifiers={[restrictToVerticalAxis]}
      >
        <SnippetList
          groups={filteredData.filteredGroups}
          snippets={filteredData.filteredSnippets}
          onRunSnippet={runSnippet}
          onEditSnippet={handleEditSnippet}
          onDeleteSnippet={handleDeleteSnippet}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
        />
        <DragOverlay>
          {activeItem ? (
            "groupName" in activeItem ? (
              <div
                className="group-header"
                style={{
                  backgroundColor: "var(--vscode-sideBar-background)",
                  opacity: 0.9,
                }}>
                <DragHandleIcon className="drag-handle" />
                <AccordionIcon isOpen={false} />
                <span className="group-name">{(activeItem as Group).groupName}</span>
              </div>
            ) : (
              <div style={{ opacity: 0.9 }}>
                <SnippetItem
                  snippet={activeItem as Snippet}
                  onRunSnippet={() => {}}
                  onEditSnippet={() => {}}
                  onDeleteSnippet={() => {}}
                  // ▼▼▼【ここから追加】▼▼▼
                  isMenuOpen={false}
                  onMenuToggle={() => {}}
                  // ▲▲▲【ここまで追加】▲▲▲
                />
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>

      {(showForm || editingContext) && !showGroupForm && (
        <SnippetForm
          onSubmit={handleAddSnippet}
          onUpdate={handleUpdateSnippet}
          onCancel={handleCancelForm}
          groups={groups}
          editingContext={editingContext}
        />
      )}

      {showGroupForm && (
        <GroupForm
          onSubmit={handleAddGroup}
          onUpdate={handleUpdateGroup}
          onCancel={handleCancelForm}
          editingGroup={editingGroup}
        />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
