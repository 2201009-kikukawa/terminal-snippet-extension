import { useState, useEffect } from "react";
import { EventTypes } from "../../types/eventTypes";
import { Snippet, Group } from "../types"; // ★ Group をインポート

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [groups, setGroups] = useState<Group[]>([]); // ★ グループ用の state を追加

  useEffect(() => {
    // 起動時にスニペットとグループの両方を取得する
    vscode.postMessage({ type: EventTypes.GetSnippets });
    vscode.postMessage({ type: EventTypes.GetGroups }); // ★ グループ取得メッセージを送信

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case EventTypes.SnippetsData:
          setSnippets(message.value);
          break;
        // ★ グループデータ受信時の処理を追加
        case EventTypes.GroupsData:
          setGroups(message.value);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const addSnippet = (snippet: Snippet) => {
    vscode.postMessage({
      type: EventTypes.AddSnippet,
      value: snippet,
    });
    setSnippets((prev) => [...prev, snippet]);
  };

  // ★ グループ追加関数を追加
  const addGroup = (group: Omit<Group, 'snippets'> & { snippets: [] }) => {
    vscode.postMessage({
      type: EventTypes.AddGroup,
      value: group,
    });
  };

  const deleteSnippet = (id: string) => {
    vscode.postMessage({
      type: EventTypes.DeleteSnippet,
      value: id,
    });
    setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
  };

  const runSnippet = (command: string) => {
    vscode.postMessage({
      type: EventTypes.RunSnippet,
      value: command,
    });
  };
  
  // ★ groups と addGroup を return に追加
  return { snippets, groups, addSnippet, addGroup, deleteSnippet, runSnippet };
};
