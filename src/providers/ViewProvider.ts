import {
  CancellationToken,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class ViewProvider implements WebviewViewProvider {
  public static readonly viewType = "sample-id";

  constructor(private readonly _extensionUri: Uri) {}

  public resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [Uri.joinPath(this._extensionUri, "out")],
    };

    webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

    webviewView.webview.onDidReceiveMessage(async (message) => {
  const fs = await import("fs");
  const path = await import("path");

  const folderPath = this._extensionUri.with({ scheme: "vscode-storage" });
  const snippetsFile = Uri.joinPath(folderPath, "snippets.json").fsPath;

  if (message.type === "addSnippet") {
    try {
      let snippets = [];
      if (fs.existsSync(snippetsFile)) {
        const content = fs.readFileSync(snippetsFile, "utf8");
        snippets = JSON.parse(content);
      }

      snippets.push(message.value);
      fs.writeFileSync(snippetsFile, JSON.stringify(snippets, null, 2), "utf8");
      console.log("スニペット保存成功");
    } catch (error) {
      console.error("スニペット保存失敗", error);
    }
  } else if (message.type === "getSnippets") {
    try {
      let snippets = [];
      if (fs.existsSync(snippetsFile)) {
        const content = fs.readFileSync(snippetsFile, "utf8");
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
});
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
    const stylesUri = getUri(webview, extensionUri, ["out", "styles.css"]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${stylesUri}" />
          <title>Sample</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }
}
