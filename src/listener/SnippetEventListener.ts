import { WebviewView, Uri, ExtensionContext } from "vscode";
import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { EventTypes } from "../types/eventTypes";
import { Snippet, Group } from "../webview/types";

export class SnippetEventListener {
  private readonly snippetsFile: string;
  private readonly groupsFile: string;

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
          await this.handleAddSnippet(message.value, webviewView);
          break;

        case EventTypes.AddGroup:
          await this.handleAddGroup(message.value, webviewView);
          break;

        case EventTypes.GetSnippets:
          this.handleGetSnippets(webviewView);
          break;

        case EventTypes.GetGroups:
          this.handleGetGroups(webviewView);
          break;

        case EventTypes.RunSnippet:
          await this.handleRunSnippet(message.value);
          break;

        case EventTypes.DeleteSnippet:
          this.handleDeleteSnippet(message.value, webviewView);
          break;

        // ▼▼▼【ここから追加】▼▼▼
        case EventTypes.UpdateSnippet:
          this.handleUpdateSnippet(message.value, webviewView);
          break;
        // ▲▲▲【ここまで追加】▲▲▲
      }
    });
  }

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

  private async handleRunSnippet(snippet: Snippet) {
    if (!snippet || !snippet.command || snippet.command.length === 0) {
      console.log("実行するコマンドがありません。");
      return;
    }

    try {
      let commandToRun: string | undefined;
      const initialCommand = snippet.command.join(" && ");

      // isEdit フラグで分岐
      if (snippet.isEdit) {
        const editedCommand = await vscode.window.showInputBox({
          prompt: "実行するコマンドを編集、または確認してEnterキーを押してください",
          value: initialCommand, // 保存されているコマンドを初期値として設定
          ignoreFocusOut: true, // 入力中に他の場所をクリックしても閉じないようにする
        });

        // ユーザーがキャンセルしなければ (undefinedでなければ) コマンドを設定
        // 空文字列も許可する（ユーザーが全削除して実行する場合も考慮）
        if (editedCommand !== undefined) {
          commandToRun = editedCommand;
        }
      } else {
        // isEditがfalseなら、そのままコマンドを結合
        commandToRun = initialCommand;
      }

      // 実行するコマンドがあればターミナルに送信
      if (commandToRun) {
        const terminal =
          vscode.window.activeTerminal ||
          vscode.window.createTerminal("Snippet Terminal");
        terminal.show();
        // ユーザーが空のコマンドを実行しようとした場合を除外
        if(commandToRun.trim() !== "") {
            terminal.sendText(commandToRun, true);
        }
      }
    } catch (error) {
      console.error("ターミナルへの送信失敗", error);
      vscode.window.showErrorMessage("コマンドの実行に失敗しました。");
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
        return;
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
        return;
      }
  
      // どこにも見つからなかった場合
      console.warn(`削除対象のスニペットが見つかりませんでした: ID=${snippetId}`);
  
    } catch (error) {
      console.error("スニペットの削除中にエラーが発生しました", error);
    }
  }

  // ▼▼▼【ここから追加】▼▼▼
  private handleUpdateSnippet(
    data: { snippet: Snippet; groupId?: string },
    webviewView: WebviewView
  ) {
    try {
      const { snippet: updatedSnippet, groupId: newGroupId } = data;

      // --- 1. 元のスニペットを全箇所から削除 ---
      const currentSnippets = this.readJsonFile<Snippet[]>(this.snippetsFile, []);
      const nextSnippets = currentSnippets.filter((s) => s.id !== updatedSnippet.id);

      const currentGroups = this.readJsonFile<Group[]>(this.groupsFile, []);
      const nextGroups = currentGroups.map((group) => ({
        ...group,
        snippets: group.snippets.filter((s) => s.id !== updatedSnippet.id),
      }));

      // --- 2. 更新されたスニペットを新しい場所に追加 ---
      if (newGroupId) {
        const groupIndex = nextGroups.findIndex((g) => g.id === newGroupId);
        if (groupIndex > -1) {
          nextGroups[groupIndex].snippets.push(updatedSnippet);
        } else {
          console.error(`更新先のグループが見つかりません: ${newGroupId}`);
          nextSnippets.push(updatedSnippet);
        }
      } else {
        nextSnippets.push(updatedSnippet);
      }

      // --- 3. ファイルに書き戻す ---
      this.writeJsonFile(this.snippetsFile, nextSnippets);
      this.writeJsonFile(this.groupsFile, nextGroups);

      console.log("スニペットを更新しました");

      // --- 4. Webviewに最新データを送信 ---
      this.handleGetSnippets(webviewView);
      this.handleGetGroups(webviewView);
    } catch (error) {
      console.error("スニペットの更新に失敗しました", error);
      vscode.window.showErrorMessage("スニペットの更新に失敗しました。");
    }
  }
  // ▲▲▲【ここまで追加】▲▲▲
  
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