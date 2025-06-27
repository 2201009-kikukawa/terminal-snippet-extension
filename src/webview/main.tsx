import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeTextField, } from "@vscode/webview-ui-toolkit/react";
import { EventTypes } from "../types/eventTypes";

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

const main = () => {
  const [showForm, setShowForm] = useState(false);
  const [snippets, setSnippets] = useState<{ name: string; command: string }[]>([]);

  const handleRegister = () => {
  const snippetName = (document.querySelector("#snippetName") as HTMLInputElement).value;
  const snippetCommand = (document.querySelector("#snippetCommand") as HTMLInputElement).value;

  if (!snippetName || !snippetCommand) {
    alert("全て入力してください");
    return;
  }

  // WebView→拡張機能へメッセージ送信
  vscode.postMessage({
    type: EventTypes.AddSnippet,
    value: {
      name: snippetName,
      command: snippetCommand,
    },
  });

  alert("登録されました");
  setShowForm(false);

  setSnippets([...snippets, { name: snippetName, command: snippetCommand }]);
};

useEffect(() => {
    vscode.postMessage({ type: EventTypes.GetSnippets });

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === EventTypes.SnippetsData) {
        setSnippets(message.value);
      }
    });
  }, []);

  return (
    <>
    {/* スニペット一覧（ボタン形式） */}
      <div className="snippet-list">
        {snippets.length === 0 ? (
          <p>スニペットはまだありません</p>
        ) : (
          snippets.map((snippet, index) => (
            <div key={index} className="snippet-item">
             <VSCodeButton
                appearance="secondary"
                title={snippet.command}
                onClick={() => {
                  vscode.postMessage({
                    type: EventTypes.RunSnippet,
                    value: snippet.command,
                  });
                }}
              >
                {snippet.name}
              </VSCodeButton>

              <VSCodeButton
                appearance="icon"
                title="削除"
                onClick={() => {

                  vscode.postMessage({
                    type: EventTypes.DeleteSnippet,
                    value: snippet, // name + command 両方送信
                  });

                  // フロント側からも即座に消す（仮想的な同期）
                  setSnippets(snippets.filter((_, i) => i !== index));
                }}
              >
                🗑️
              </VSCodeButton>
            </div>
          ))
        )}
      </div>

      <VSCodeButton appearance="icon" onClick={() => setShowForm(true)}>
        <span className="add-button-icon">＋</span>
      </VSCodeButton>

      {showForm && (
        <div className="form-container">
          <h3>新規登録フォーム</h3>
          <VSCodeTextField id="snippetName"  placeholder="スニペット名" className="form-textfield" />
          <VSCodeTextField id="snippetCommand"  placeholder="追加コマンド" className="form-textfield" />

          <br />
          <div className="form-actions">
            <VSCodeButton onClick={handleRegister}>登録</VSCodeButton>
            <VSCodeButton onClick={() => setShowForm(false)}>閉じる</VSCodeButton>
          </div>
        </div>
      )}
    </>
  );
};

export default main;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(React.createElement(main));
