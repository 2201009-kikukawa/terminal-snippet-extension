import { useState, useEffect } from "react";
import { EventTypes } from "../../types/eventTypes";
import { Snippet } from "../types";

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    vscode.postMessage({ type: EventTypes.GetSnippets });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === EventTypes.SnippetsData) {
        setSnippets(message.value);
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
  return { snippets, addSnippet, deleteSnippet, runSnippet };
};
