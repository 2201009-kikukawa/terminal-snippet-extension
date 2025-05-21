import { WebviewView, Uri, ExtensionContext } from "vscode";
import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";

export class SnippetEventListener {
  private readonly snippetsFile: string;

  constructor(private readonly context: ExtensionContext) {
    const fileUri = Uri.joinPath(context.globalStorageUri, "snippets.json");
    this.snippetsFile = fileUri.fsPath;

    const dirPath = path.dirname(this.snippetsFile);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  public setWebviewMessageListener(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message) => {

      switch (message.type) {
        case "addSnippet":
          await this.handleAddSnippet(message.value);
          break;

        case "getSnippets":
          this.handleGetSnippets(webviewView);
          break;

        case "runSnippet":
          this.handleRunSnippet(message.value);
          break;

        case "deleteSnippet":
          this.handleDeleteSnippet(message.value, webviewView);
          break;
      }
    });
  }

  private async handleAddSnippet(value: { name: string; command: string }) {
    try {
      let snippets = [];
      if (fs.existsSync(this.snippetsFile)) {
        const content = fs.readFileSync(this.snippetsFile, "utf8");
        snippets = JSON.parse(content);
      }

      snippets.push(value);
      fs.writeFileSync(this.snippetsFile, JSON.stringify(snippets, null, 2), "utf8");
      console.log("スニペット保存成功");
    } catch (error) {
      console.error("スニペット保存失敗", error);
    }
  }

  private handleGetSnippets(webviewView: WebviewView) {
    try {
      let snippets = [];
      if (fs.existsSync(this.snippetsFile)) {
        const content = fs.readFileSync(this.snippetsFile, "utf8");
        snippets = JSON.parse(content);
      }
      webviewView.webview.postMessage({
        type: "snippetsData",
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

  private handleDeleteSnippet(value: { name: string; command: string }, webviewView: WebviewView) {
    try {
      let snippets = [];
      if (fs.existsSync(this.snippetsFile)) {
        const content = fs.readFileSync(this.snippetsFile, "utf8");
        snippets = JSON.parse(content);
      }

      snippets = snippets.filter(
        (s: any) => s.name !== value.name || s.command !== value.command
      );

      fs.writeFileSync(this.snippetsFile, JSON.stringify(snippets, null, 2), "utf8");
      console.log("スニペット削除成功");

      webviewView.webview.postMessage({
        type: "snippetsData",
        value: snippets,
      });
    } catch (error) {
      console.error("スニペット削除失敗", error);
    }
  }
}