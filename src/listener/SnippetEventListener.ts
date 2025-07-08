import { WebviewView, Uri, ExtensionContext } from "vscode";
import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { EventTypes } from "../types/eventTypes";
import * as crypto from "crypto"; // ★ 1. cryptoモジュールをインポート

export class SnippetEventListener {
  private readonly snippetsFile: string;

  constructor(private readonly context: ExtensionContext) {
    const fileUri = Uri.joinPath(context.globalStorageUri, "snippets.json");
    this.snippetsFile = fileUri.fsPath;

    const dirPath = path.dirname(this.snippetsFile);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 初回作成時に空ファイルを用意（なければ）
    if (!fs.existsSync(this.snippetsFile)) {
      fs.writeFileSync(this.snippetsFile, JSON.stringify([], null, 2), "utf8");
    }
  }

  public setWebviewMessageListener(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message) => {

      switch (message.type) {
        case EventTypes.AddSnippet:
          await this.handleAddSnippet(message.value);
          // ★ 4. 追加後、最新のリストを再送信する
          this.handleGetSnippets(webviewView);
          break;

        case EventTypes.GetSnippets:
          this.handleGetSnippets(webviewView);
          break;

        case EventTypes.RunSnippet:
          this.handleRunSnippet(message.value);
          break;

        case EventTypes.DeleteSnippet:
          // ★ 5. message.value (id) を渡すように変更
          this.handleDeleteSnippet(message.value, webviewView);
          break;
      }
    });
  }

  private async handleAddSnippet(value: { name: string; command: string }) {
    try {
      if (!fs.existsSync(this.snippetsFile)) {
        return console.error("スニペットファイルが存在しません");
      }

      const currentSnippets = JSON.parse(fs.readFileSync(this.snippetsFile, "utf8"));

      // ★ 2. IDを付与した新しいスニペットオブジェクトを作成
      const newSnippet = { id: crypto.randomUUID(), ...value,};

      const updatedSnippets = [...currentSnippets, newSnippet];
      
      fs.writeFileSync(this.snippetsFile, JSON.stringify(updatedSnippets, null, 2), "utf8");
      console.log("スニペット保存成功");
    } catch (error) {
      console.error("スニペット保存失敗", error);
    }
  }

  private handleGetSnippets(webviewView: WebviewView) {
    try {
      if (!fs.existsSync(this.snippetsFile)) {
        return console.error("スニペットファイルが存在しません");
      }

      const content = fs.readFileSync(this.snippetsFile, "utf8");
      const snippets = JSON.parse(content);

      webviewView.webview.postMessage({
        type: EventTypes.SnippetsData,
        value: snippets,
      });
    } catch (error) {
      console.error("スニペット読み込み失敗", error);
    }
  }

  private handleRunSnippet(command: string) {
    try {
      const terminal = vscode.window.activeTerminal || vscode.window.createTerminal("Snippet Terminal");
      terminal.show();
      terminal.sendText(command, true);
    } catch (error) {
      console.error("ターミナルへの送信失敗", error);
    }
  }

  // ★ 3. 削除処理をIDベースに変更
  private handleDeleteSnippet(snippetId: string, webviewView: WebviewView) {
    try {
      if (!fs.existsSync(this.snippetsFile)) {
        return console.error("スニペットファイルが存在しません");
      }

      const content = fs.readFileSync(this.snippetsFile, "utf8");
      const currentSnippets = JSON.parse(content);

      const updatedSnippets = currentSnippets.filter(
        (s: any) => s.id !== snippetId
      );

      fs.writeFileSync(this.snippetsFile, JSON.stringify(updatedSnippets, null, 2), "utf8");
      console.log("スニペット削除成功");

      webviewView.webview.postMessage({
        type: EventTypes.SnippetsData,
        value: updatedSnippets,
      });
    } catch (error) {
      console.error("スニペット削除失敗", error);
    }
  }
}