import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TreeItem {
  name: string;
  children?: TreeItem[];
  isFile?: boolean;
}

export class FolderStructureProvider {
  constructor(private workspaceRoot: string | undefined = vscode.workspace.rootPath) {}

  public generateFolderStructureText(): string {
    if (!this.workspaceRoot) {
      return '';
    }

    const treeItems: TreeItem[] = this.getChildrenFromPath(this.workspaceRoot, true);
    return this.buildFolderStructureText(treeItems, '');
  }

  private buildFolderStructureText(items: TreeItem[], indent: string): string {
    let output = '';
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      output += `${indent}${isLast ? '└── ' : '├── '}${item.name}${item.isFile ? '' : '/'}`;
      output += '\n';
      if (item.children) {
        const newIndent = `${indent}${isLast ? '    ' : '│   '}`;
        output += this.buildFolderStructureText(item.children, newIndent);
      }
    });
    return output;
  }

  private getChildrenFromPath(dirPath: string, recursive: boolean): TreeItem[] {
    const treeItems: TreeItem[] = [];
    const children = fs.readdirSync(dirPath, { withFileTypes: true });
    children.forEach(child => {
      if (child.isDirectory() && child.name !== '.git') {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path.join(dirPath, child.name)));
        if (workspaceFolder) {
          const subTreeItem: TreeItem = { name: child.name };
          if (recursive) {
            subTreeItem.children = this.getChildrenFromPath(path.join(dirPath, child.name), recursive);
          }
          treeItems.push(subTreeItem);
        }
      } else if (child.isFile()) {
        treeItems.push({ name: child.name, isFile: true });
      }
    });
    return treeItems;
  }

  public async removeFolderFromTree() {
    const folderName = await vscode.window.showInputBox({
      prompt: 'Enter folder name to remove from tree:',
      ignoreFocusOut: true,
    });

    if (!folderName) {
      return;
    }

    const treeItems: TreeItem[] = this.getChildrenFromPath(this.workspaceRoot!, true);
    this.removeFolderFromTreeItems(treeItems, folderName);
    const folderStructureText = this.buildFolderStructureText(treeItems, '');
    const doc = await vscode.workspace.openTextDocument({ content: folderStructureText });
    vscode.window.showTextDocument(doc);
  }

  private removeFolderFromTreeItems(items: TreeItem[], folderName: string) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.children) {
        this.removeFolderFromTreeItems(item.children, folderName);
        if (item.children.length === 0) {
          delete item.children;
        }
      }
      if (item.name === folderName) {
        items.splice(i, 1);
      }
    }
  }
}
