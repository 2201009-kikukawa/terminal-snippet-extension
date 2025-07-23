import { useState, useEffect } from "react";
import { EventTypes } from "../../types/eventTypes";
import { Snippet, Group } from "../types";

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    // 起動時にスニペットとグループの両方を取得する
    vscode.postMessage({ type: EventTypes.GetSnippets });
    vscode.postMessage({ type: EventTypes.GetGroups });

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

  // ★ addSnippet が groupId を受け取れるように変更
  const addSnippet = (snippet: Snippet, groupId?: string) => {
    vscode.postMessage({
      type: EventTypes.AddSnippet,
      // ★ snippet と groupId を value オブジェクトで渡す
      value: { snippet, groupId },
    });
    // ★ 楽観的更新を削除。バックエンドからの SnippetsData or GroupsData イベントでUIが更新される
  };

  // ★ addGroup の型を新しい Group 型に合わせる
  const addGroup = (group: Group) => {
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
    // ★ こちらも楽観的更新を削除し、バックエンドからのレスポンスに任せる
  };

  const runSnippet = (command: string) => {
    vscode.postMessage({
      type: EventTypes.RunSnippet,
      value: command,
    });
  };
  
  return { snippets, groups, addSnippet, addGroup, deleteSnippet, runSnippet };
};
