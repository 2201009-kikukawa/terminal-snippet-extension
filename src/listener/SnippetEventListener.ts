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
          // ★ webviewView を渡すように変更
          await this.handleAddSnippet(message.value, webviewView);
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
          this.handleRunSnippet(message.value); // ★ 変更
          break;

        case EventTypes.DeleteSnippet:
          this.handleDeleteSnippet(message.value, webviewView);
          break;
      }
    });
  }

  // ★ 型を Group に変更
  private async handleAddGroup(group: Group, webviewView: WebviewView) {
    try {
      const currentGroups = this.readJsonFile<Group[]>(this.groupsFile, []);
      const updatedGroups = [...currentGroups, group];
      this.writeJsonFile(this.groupsFile, updatedGroups);
      console.log("グループ保存成功");
      this.handleGetGroups(webviewView);
    } catch (error) {
      console.error("グループ保存失敗", error);
    }
  }

  // ★ handleAddSnippet を全面的に書き換え
  private async handleAddSnippet(
    data: { snippet: Snippet; groupId?: string },
    webviewView: WebviewView
  ) {
    const { snippet, groupId } = data;

    if (groupId) {
      // グループIDがある場合: groups.json を更新
      try {
        const currentGroups = this.readJsonFile<Group[]>(this.groupsFile, []);
        const groupIndex = currentGroups.findIndex((g) => g.id === groupId);

        if (groupIndex === -1) {
          console.error(`グループが見つかりません: ${groupId}`);
          return;
        }

        currentGroups[groupIndex].snippets.push(snippet);
        this.writeJsonFile(this.groupsFile, currentGroups);
        console.log("グループ内にスニペットを保存成功");
        
        // 更新されたグループデータをWebviewに送信
        this.handleGetGroups(webviewView);

      } catch (error) {
        console.error("グループへのスニペット保存失敗", error);
      }
    } else {
      // グループIDがない場合: snippets.json を更新
      try {
        const currentSnippets = this.readJsonFile<Snippet[]>(this.snippetsFile, []);
        const updatedSnippets = [...currentSnippets, snippet];
        this.writeJsonFile(this.snippetsFile, updatedSnippets);
        console.log("スニペット保存成功");

        // 更新されたスニペットデータをWebviewに送信
        this.handleGetSnippets(webviewView);

      } catch (error) {
        console.error("スニペット保存失敗", error);
      }
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

  private handleRunSnippet(commands: string[]) {
    if (!commands || commands.length === 0) {
      console.log("実行するコマンドがありません。");
      return;
    }
    try {
      const terminal =
        vscode.window.activeTerminal || vscode.window.createTerminal("Snippet Terminal");
      terminal.show();
      // ★ 複数のコマンドを ' && ' で連結して一度に送信
      const fullCommand = commands.join(" && ");
      terminal.sendText(fullCommand, true);
    } catch (error) {
      console.error("ターミナルへの送信失敗", error);
    }
  }

  private handleDeleteSnippet(snippetId: string, webviewView: WebviewView) {
    try {
      // 1. グループ化されていないスニペットから探す
      const currentSnippets = this.readJsonFile<Snippet[]>(this.snippetsFile, []);
      const updatedSnippets = currentSnippets.filter((s: Snippet) => s.id !== snippetId);
  
      // 配列の長さが変わっていれば、削除成功
      if (updatedSnippets.length < currentSnippets.length) {
        this.writeJsonFile(this.snippetsFile, updatedSnippets);
        console.log("グループ化されていないスニペットを削除しました");
        // 更新後のデータをWebviewに送信
        webviewView.webview.postMessage({
          type: EventTypes.SnippetsData,
          value: updatedSnippets,
        });
        return; // 処理完了
      }
  
      // 2. グループ化されていないスニペットになければ、グループの中から探す
      const currentGroups = this.readJsonFile<Group[]>(this.groupsFile, []);
      let wasDeleted = false;
  
      const updatedGroups = currentGroups.map((group) => {
        const initialLength = group.snippets.length;
        // グループ内のスニペットをフィルタリング
        const filteredSnippets = group.snippets.filter((s) => s.id !== snippetId);
  
        // 削除されたかチェック
        if (filteredSnippets.length < initialLength) {
          wasDeleted = true;
        }
        
        return { ...group, snippets: filteredSnippets };
      });
  
      // いずれかのグループで削除が行われた場合
      if (wasDeleted) {
        this.writeJsonFile(this.groupsFile, updatedGroups);
        console.log("グループ内のスニペットを削除しました");
        // 更新後のグループデータをWebviewに送信
        webviewView.webview.postMessage({
          type: EventTypes.GroupsData,
          value: updatedGroups,
        });
        return; // 処理完了
      }
  
      // どこにも見つからなかった場合
      console.warn(`削除対象のスニペットが見つかりませんでした: ID=${snippetId}`);
  
    } catch (error) {
      console.error("スニペットの削除中にエラーが発生しました", error);
    }
  }
  // ▲▲▲【ここまで修正】▲▲▲
  

  // ★ ユーティリティ関数を追加して重複を削減
  private readJsonFile<T>(filePath: string, defaultValue: T): T {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as T;
  }

  private writeJsonFile(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }
}