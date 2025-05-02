import React, { useState } from "react";
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

const main = () => {
  const [showForm, setShowForm] = useState(false);

  const handleRegister = () => {
    // 登録処理を書く場所
    alert("登録されました");
    setShowForm(false); // 登録後に閉じる
  };

  return (
    <>
      {/* <VSCodeButton onClick={() => setShowForm(true)}>新規追加</VSCodeButton> */}
      <VSCodeButton appearance="icon" onClick={() => setShowForm(true)}>
        <span style={{ fontSize: "1.2em", fontWeight: "bold", lineHeight: "1" }}>＋</span>
      </VSCodeButton>

      {showForm && (
        <div style={{ marginTop: "1em", border: "1px solid #ccc", padding: "1em" }}>
          <h3>新規登録フォーム</h3>
          <input type="text" placeholder="スニペット名" style={{ width: "100%", marginBottom: "0.5em" }} />
          <input type="text" placeholder="追加コマンド" style={{ width: "100%", marginBottom: "0.5em" }} />

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
