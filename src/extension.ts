import * as vscode from 'vscode';
import { FolderStructureProvider } from './tree-generator';

export function activate(context: vscode.ExtensionContext) {
  console.log('Folder Structure Extension is now active.');

  // Create the folder structure provider
  const folderStructureProvider = new FolderStructureProvider();

  // Generate the folder structure text when the command is executed
  context.subscriptions.push(
    vscode.commands.registerCommand('folderStructure.generateFolderStructureText', () => {
      const folderStructureText = folderStructureProvider.generateFolderStructureText();
      if (folderStructureText) {
        vscode.workspace.openTextDocument({ language: 'plaintext', content: folderStructureText }).then(doc => {
          vscode.window.showTextDocument(doc, { preview: false });
        });
      } else {
        vscode.window.showErrorMessage('Unable to generate folder structure text.');
      }
    })
  );

  // Register the command to remove a folder from the generated folder structure text
  context.subscriptions.push(
    vscode.commands.registerCommand('folderStructure.removeFolderFromStructure', () => {
      // Show an input box to get the folder name to remove
      vscode.window.showInputBox({
        prompt: 'Enter the folder name to remove from the folder structure text',
        ignoreFocusOut: true
      }).then(folderName => {
        if (folderName) {
          folderStructureProvider.removeFolderFromTree();
          vscode.window.showInformationMessage(`Folder "${folderName}" has been removed from the folder structure text.`);
        }
      });
    })
  );
}

export function deactivate() {
  console.log('Folder Structure Extension has been deactivated.');
}
