import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

// const main = () => {
//   const [text, setText] = useState<string>("");

//   return (
//     <>
//       <VSCodeButton onClick={(e) => setText("ボタンがクリックされました")}>新規追加</VSCodeButton>
//       <div>{text}</div>
//     </>
//   );
// };

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
    type: "addSnippet",
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
    vscode.postMessage({ type: "getSnippets" });

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "snippetsData") {
        setSnippets(message.value);
      }
    });
  }, []);

  return (
    <>
    {/* スニペット一覧（ボタン形式） */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", marginBottom: "1em" }}>
        {snippets.length === 0 ? (
          <p>スニペットはまだありません</p>
        ) : (
          snippets.map((snippet, index) => (
            <VSCodeButton key={index} appearance="secondary">
              {snippet.name}
            </VSCodeButton>
          ))
        )}
      </div>

      {/* <VSCodeButton onClick={() => setShowForm(true)}>新規追加</VSCodeButton> */}
      <VSCodeButton appearance="icon" onClick={() => setShowForm(true)}>
        <span style={{ fontSize: "1.2em", fontWeight: "bold", lineHeight: "1" }}>＋</span>
      </VSCodeButton>

      {showForm && (
        <div style={{ marginTop: "1em", border: "1px solid #ccc", padding: "1em" }}>
          <h3>新規登録フォーム</h3>
          <input id="snippetName" type="text" placeholder="スニペット名" style={{ width: "100%", marginBottom: "0.5em" }} />
          <input id="snippetCommand" type="text" placeholder="追加コマンド" style={{ width: "100%", marginBottom: "0.5em" }} />

          <br />
          {/* <VSCodeButton onClick={() => setShowForm(false)}>閉じる</VSCodeButton> */}
          <div style={{ display: "flex", gap: "0.5em", justifyContent: "flex-end" }}>
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
