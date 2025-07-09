import { WebviewView, Uri, ExtensionContext } from "vscode";
import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { EventTypes } from "../types/eventTypes";
import { Snippet } from "../webview/types";

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
          this.handleGetSnippets(webviewView);
          break;

        case EventTypes.GetSnippets:
          this.handleGetSnippets(webviewView);
          break;

        case EventTypes.RunSnippet:
          this.handleRunSnippet(message.value);
          break;

        case EventTypes.DeleteSnippet:
          this.handleDeleteSnippet(message.value, webviewView);
          break;
      }
    });
  }

  private async handleAddSnippet(value: Snippet) {
    try {
      if (!fs.existsSync(this.snippetsFile)) {
        return console.error("スニペットファイルが存在しません");
      }

      const currentSnippets = JSON.parse(fs.readFileSync(this.snippetsFile, "utf8"));
      const updatedSnippets = [...currentSnippets, value];

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
      const terminal =
        vscode.window.activeTerminal || vscode.window.createTerminal("Snippet Terminal");
      terminal.show();
      terminal.sendText(command, true);
    } catch (error) {
      console.error("ターミナルへの送信失敗", error);
    }
  }

  private handleDeleteSnippet(snippetId: string, webviewView: WebviewView) {
    try {
      if (!fs.existsSync(this.snippetsFile)) {
        return console.error("スニペットファイルが存在しません");
      }

      const content = fs.readFileSync(this.snippetsFile, "utf8");
      const currentSnippets = JSON.parse(content);
      const updatedSnippets = currentSnippets.filter((s: Snippet) => s.id !== snippetId);

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
