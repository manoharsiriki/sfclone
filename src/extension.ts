import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
  const cloneCommand = vscode.commands.registerCommand('sfclone.cloneComponent', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Please open a component file to clone.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const folder = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const cloneName = `${baseName}-Clone${ext}`;
    const clonePath = path.join(folder, cloneName);

    try {
      await fse.copy(filePath, clonePath);

      // Also copy corresponding meta.xml if it's an Apex class or trigger
      if (ext === '.cls' || ext === '.trigger') {
        const metaFile = `${filePath}-meta.xml`;
        const metaClonePath = `${clonePath}-meta.xml`;
        if (fs.existsSync(metaFile)) {
          await fse.copy(metaFile, metaClonePath);
        }
      }

      vscode.window.showInformationMessage(`SFClone: Created clone as ${cloneName}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`SFClone: Clone failed – ${err.message}`);
    }
  });

  const backupCommand = vscode.commands.registerCommand('sfclone.backupComponent', async () => {
    const editor = vscode.window.activeTextEditor;
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!editor || !workspaceFolders) {
      vscode.window.showErrorMessage('Please open a file inside a Salesforce project.');
      return;
    }

    const userChoice = await vscode.window.showQuickPick(
      ['Backup current file or component', 'Backup all components (classes, lwc, aura)'],
      {
        placeHolder: 'What would you like to back up?',
      }
    );

    if (!userChoice) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const label = await vscode.window.showInputBox({
      prompt: 'Enter an optional label for the backup folder',
      placeHolder: 'e.g. pre-deployment',
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderLabel = label ? `${timestamp}_${label.replace(/[^a-zA-Z0-9-_]/g, '-')}` : timestamp;
    const backupRootDir = path.join(rootPath, 'SFClone Backup', folderLabel);

    try {
      if (userChoice === 'Backup all components (classes, lwc, aura)') {
        const folders = ['force-app', 'main', 'default'];
        const types = ['classes', 'lwc', 'aura'];

        for (const type of types) {
          const src = path.join(rootPath, ...folders, type);
          const dest = path.join(backupRootDir, type);
          if (fs.existsSync(src)) {
            await copyRecursive(src, dest);
          }
        }
      } else {
        const filePath = editor.document.uri.fsPath;
        const match = filePath.match(/(lwc|aura|classes)/);
        const type = match ? match[1] : null;

        if (!type) {
          vscode.window.showErrorMessage('Only Apex, LWC, or Aura components are supported.');
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

        await copyComponentWithMeta(source, destination);
      }

      vscode.window.showInformationMessage(`SFClone: Backup created at ${backupRootDir}`);

      // Add backup folder to .gitignore
      const gitignorePath = path.join(rootPath, '.gitignore');
      const ignoreEntry = '/SFClone Backup/';
      if (fs.existsSync(gitignorePath)) {
        const current = await fse.readFile(gitignorePath, 'utf8');
        if (!current.includes(ignoreEntry)) {
          await fse.appendFile(gitignorePath, `\n${ignoreEntry}`);
        }
      } else {
        await fse.writeFile(gitignorePath, `${ignoreEntry}\n`);
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`SFClone: Backup failed – ${err.message}`);
    }
  });

  context.subscriptions.push(cloneCommand, backupCommand);
}

async function copyRecursive(src: string, dest: string) {
  if (fs.existsSync(src)) {
    await fse.copy(src, dest);
    // If it's a file, also check and copy the metadata file
    if (fs.statSync(src).isFile()) {
      const metaFile = `${src}-meta.xml`;
      const metaDest = `${dest}-meta.xml`;
      if (fs.existsSync(metaFile)) {
        await fse.copy(metaFile, metaDest);
      }
    }
  }
}

async function copyComponentWithMeta(src: string, dest: string) {
  await fse.copy(src, dest);

  // Also copy corresponding meta.xml if it's an Apex class or trigger
  const ext = path.extname(src);
  if (ext === '.cls' || ext === '.trigger') {
    const metaFile = `${src}-meta.xml`;
    const metaDest = `${dest}-meta.xml`;
    if (fs.existsSync(metaFile)) {
      await fse.copy(metaFile, metaDest);
    }
  }
}

export function deactivate() {}
