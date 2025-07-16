import { WebviewView, Uri, ExtensionContext } from "vscode";
import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { EventTypes } from "../types/eventTypes";
import { Snippet, Group } from "../webview/types";

export class SnippetEventListener {
  private readonly snippetsFile: string;
  private readonly groupsFile: string; // ★ 追加

  constructor(private readonly context: ExtensionContext) {
    // ★ スニペットファイルのパス設定
    const fileUri = Uri.joinPath(context.globalStorageUri, "snippets.json");
    this.snippetsFile = fileUri.fsPath;

    // ★ グループファイルのパス設定
    const groupsFileUri = Uri.joinPath(context.globalStorageUri, "groups.json");
    this.groupsFile = groupsFileUri.fsPath;

    const dirPath = path.dirname(this.snippetsFile);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // ★ スニペットファイルがなければ作成
    if (!fs.existsSync(this.snippetsFile)) {
      fs.writeFileSync(this.snippetsFile, JSON.stringify([], null, 2), "utf8");
    }

    // ★ グループファイルがなければ作成
    if (!fs.existsSync(this.groupsFile)) {
      fs.writeFileSync(this.groupsFile, JSON.stringify([], null, 2), "utf8");
    }
  }

  public setWebviewMessageListener(webviewView: WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case EventTypes.AddSnippet:
          await this.handleAddSnippet(message.value);
          break;

        // ★ 以下を追加
        case EventTypes.AddGroup:
          // ★ webviewView を渡すように変更
          await this.handleAddGroup(message.value, webviewView);
          break;

        case EventTypes.GetSnippets:
          this.handleGetSnippets(webviewView);
          break;

        // ★ 以下を追加
        case EventTypes.GetGroups:
          this.handleGetGroups(webviewView);
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

  // ★ webviewView を引数に追加
  private async handleAddGroup(group: Group, webviewView: WebviewView) {
    try {
      const currentGroups = JSON.parse(fs.readFileSync(this.groupsFile, "utf8"));
      const updatedGroups = [...currentGroups, group];

      fs.writeFileSync(this.groupsFile, JSON.stringify(updatedGroups, null, 2), "utf8");
      console.log("グループ保存成功");
      
      // ★ 保存成功後、最新のグループリストをWebviewに送信
      this.handleGetGroups(webviewView);

    } catch (error) {
      console.error("グループ保存失敗", error);
    }
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

  // ★ 以下を追加
  private handleGetGroups(webviewView: WebviewView) {
    try {
      if (!fs.existsSync(this.groupsFile)) {
        return console.error("グループファイルが存在しません");
      }
      const content = fs.readFileSync(this.groupsFile, "utf8");
      const groups = JSON.parse(content);

      webviewView.webview.postMessage({
        type: EventTypes.GroupsData,
        value: groups,
      });
    } catch (error) {
      console.error("グループ読み込み失敗", error);
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