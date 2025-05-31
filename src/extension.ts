import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('sfclone.cloneComponents', async () => {
    const editor = vscode.window.activeTextEditor;
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!editor || !workspaceFolders) {
      vscode.window.showErrorMessage('Please open a file inside a Salesforce project to use SFClone.');
      return;
    }

    const userChoice = await vscode.window.showQuickPick(
      ['Backup current file or component', 'Backup all components (classes, lwc, aura)'],
      {
        placeHolder: 'What would you like to back up?',
      }
    );

    if (!userChoice) {
      return; // User cancelled
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    // Ask for optional label
    const label = await vscode.window.showInputBox({
      prompt: 'Enter an optional label for the backup folder',
      placeHolder: 'e.g. pre-deployment-refactor',
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderLabel = label ? `${timestamp}_${label.replace(/[^a-zA-Z0-9-_]/g, '-')}` : timestamp;
    const backupRootDir = path.join(rootPath, 'SFClone Backup', folderLabel);

    try {
      if (userChoice === 'Backup all components (classes, lwc, aura)') {
        const srcFolders = ['force-app', 'main', 'default'];
        const typesToBackup = ['classes', 'lwc', 'aura'];

        for (const type of typesToBackup) {
          const sourceDir = path.join(rootPath, ...srcFolders, type);
          const destDir = path.join(backupRootDir, type);
          if (fs.existsSync(sourceDir)) {
            await fs.copy(sourceDir, destDir);
          }
        }
      } else {
        const filePath = editor.document.uri.fsPath;
        const fileTypeMatch = filePath.match(/(lwc|aura|classes)/);
        const type = fileTypeMatch ? fileTypeMatch[1] : null;

        if (!type) {
          vscode.window.showErrorMessage('Unable to determine component type. Only Apex, LWC, or Aura components are supported.');
          return;
        }

        let source: string;
        let destination: string;

        if (type === 'lwc' || type === 'aura') {
          const folderPath = path.dirname(filePath);
          const folderName = path.basename(folderPath);
          source = folderPath;
          destination = path.join(backupRootDir, type, folderName);
        } else {
          const fileName = path.basename(filePath);
          source = filePath;
          destination = path.join(backupRootDir, type, fileName);
        }

        await fs.copy(source, destination);
      }

      vscode.window.showInformationMessage(`SFClone: Backup created at ${backupRootDir}`);

      // Add /SFClone Backup/ to .gitignore
      const gitignorePath = path.join(rootPath, '.gitignore');
      const ignoreEntry = '/SFClone Backup/';

      if (fs.existsSync(gitignorePath)) {
        const currentIgnore = await fs.readFile(gitignorePath, 'utf8');
        if (!currentIgnore.includes(ignoreEntry)) {
          await fs.appendFile(gitignorePath, `\n${ignoreEntry}`);
        }
      } else {
        await fs.writeFile(gitignorePath, `${ignoreEntry}\n`);
      }

    } catch (error: any) {
      vscode.window.showErrorMessage(`SFClone: Backup failed – ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
