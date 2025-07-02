import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton, VSCodeTextField, } from "@vscode/webview-ui-toolkit/react";
import { EventTypes } from "../types/eventTypes";

declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

const main = () => {
  const [showForm, setShowForm] = useState(false);
  const [snippets, setSnippets] = useState<{ name: string; command: string }[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  // 外部クリックでドロップダウンを閉じる処理
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


  return (
    <>
      {/* スニペット一覧（ボタン形式） */}
      <div className="snippet-list">
        <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex" }}>
          {/* --- ボタン部分 --- */}
          <div style={{ display: "flex" }}>
            <VSCodeButton
              style={{ borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: "none" 
              }}
              // ★★★ 修正点1: フォームを表示するonClickイベントをここに追加 ★★★
              onClick={() => setShowForm(true)}
            >
              {/* <span slot="start" className="codicon codicon-add"></span> */}
              スニペットを追加する
            </VSCodeButton>
            <VSCodeButton
              onClick={handleDropdownToggle}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: "1px solid var(--button-secondary-background)",
              }}
            >
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{ verticalAlign: "middle" }}
              >
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
              </svg>

            </VSCodeButton>
          </div>

          {/* --- ドロップダウンメニュー部分 --- */}
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%", // ボタンの真下に表示
                left: 0,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                width: "100%", // ボタンと同じ幅にする
                background: "var(--vscode-menu-background)",
                border: "1px solid var(--vscode-menu-border)",
                boxShadow: "var(--vscode-menu-shadow)",
                padding: "4px 0",
                marginTop: "2px",
                borderRadius: "3px",
              }}
            >
              {/* ★★★ 修正点3: VSCodeOptionをVSCodeButtonに置き換え ★★★ */}
              <VSCodeButton appearance="secondary" style={{ width: "100%", textAlign: "left" }}>
                オプション 1
              </VSCodeButton>
              <VSCodeButton appearance="secondary" style={{ width: "100%", textAlign: "left" }}>
                別のオプション
              </VSCodeButton>
            </div>
          )}
      </div>

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
