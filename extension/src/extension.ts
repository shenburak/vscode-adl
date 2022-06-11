// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { HelloWorldPanel } from "./HelloWorldPanel";
import { SidebarProvider } from "./SidebarProvider";
import { TokenManager } from "./TokenManager";

export function activate(context: vscode.ExtensionContext) {
  TokenManager.globalState = context.globalState;

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = "$(beaker) Add Todo";
  item.command = "vstodo.addTodo";
  item.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.addTodo", () => {
      const { activeTextEditor } = vscode.window;

      if (!activeTextEditor) {
        vscode.window.showInformationMessage("No active text editor");
        return;
      }

      const text = activeTextEditor.document.getText(
        activeTextEditor.selection
      );

      sidebarProvider._view?.webview.postMessage({
        type: "new-todo",
        value: text,
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.helloWorld", () => {
      vscode.window.showInformationMessage(
        "token value is: " + TokenManager.getToken()
      );
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        let document = editor.document;
        const documentFileNameSplit = document.fileName.split(".");
        const isAdl =
          documentFileNameSplit[documentFileNameSplit.length - 1] === "adl";

        if (!isAdl) {
          return vscode.window.showErrorMessage("Please use with adl files");
        }

        // Get the document text
        const documentText = document.getText();

        // DO SOMETHING WITH `documentText`
        HelloWorldPanel.createOrShow(context.extensionUri, documentText);
      } else {
        vscode.window.showErrorMessage("Please use with adl files");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.authenticate", () => {
      try {
        authenticate(() => {});
      } catch (err) {
        console.log(err);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.refresh", async () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        let document = editor.document;
        const documentFileNameSplit = document.fileName.split(".");
        const isAdl =
          documentFileNameSplit[documentFileNameSplit.length - 1] === "adl";

        if (!isAdl) {
          return vscode.window.showErrorMessage("Please use with adl files");
        }

        // Get the document text
        const documentText = document.getText();

        // DO SOMETHING WITH `documentText`
        HelloWorldPanel.kill();
        HelloWorldPanel.createOrShow(context.extensionUri, documentText);
      } else {
        vscode.window.showErrorMessage("Please use with adl files");
      }
      await vscode.commands.executeCommand("workbench.action.closeSidebar");
      await vscode.commands.executeCommand(
        "workbench.view.extension.vstodo-sidebar-view"
      );
      setTimeout(() => {
        vscode.commands.executeCommand(
          "workbench.action.webview.openDeveloperTools"
        );
      }, 500);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.askQuestion", async () => {
      const answer = await vscode.window.showInformationMessage(
        "How was your day?",
        "good",
        "bad"
      );

      if (answer === "bad") {
        vscode.window.showInformationMessage("Sorry to hear that");
      } else {
        console.log({ answer });
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
