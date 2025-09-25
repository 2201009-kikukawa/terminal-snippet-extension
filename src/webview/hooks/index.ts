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

        case EventTypes.GroupsData:
          setGroups(message.value);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const addSnippet = (snippet: Snippet, groupId?: string) => {
    vscode.postMessage({
      type: EventTypes.AddSnippet,
      value: { snippet, groupId },
    });
  };

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
  };

  const runSnippet = (snippet: Snippet) => {
    vscode.postMessage({
      type: EventTypes.RunSnippet,
      value: snippet, // snippet オブジェクト全体を送信
    });
  };

    // ▼▼▼【ここから追加】▼▼▼
  const updateSnippet = (snippet: Snippet, groupId?: string) => {
    vscode.postMessage({
      type: EventTypes.UpdateSnippet,
      value: { snippet, groupId },
    });
  };
  // ▲▲▲【ここまで追加】▲▲▲
  
  // ▼▼▼【ここを修正】▼▼▼
  return { snippets, groups, addSnippet, addGroup, deleteSnippet, runSnippet, updateSnippet };
  // ▲▲▲【ここまで修正】▲▲▲
};
