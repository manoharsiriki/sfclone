import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = 'SFClone Ready';
    statusBar.show();

    const cloneCommand = vscode.commands.registerCommand('sfclone.cloneComponent', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a component file to clone.');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const folderPath = path.dirname(filePath);
        const rootFolderParts = folderPath.split(path.sep);
        const typeFolder = rootFolderParts.includes('lwc')
            ? 'lwc'
            : rootFolderParts.includes('aura')
                ? 'aura'
                : null;

        try {
            statusBar.text = 'SFClone: Cloning...';

            if (typeFolder) {
                const parentPath = path.dirname(folderPath);
                const originalFolderName = path.basename(folderPath);
                const cloneFolderName = `${originalFolderName}-clone`;
                const cloneFolderPath = path.join(parentPath, cloneFolderName);

                await fse.ensureDir(cloneFolderPath);

                const files = await fse.readdir(folderPath);
                for (const file of files) {
                    const originalFilePath = path.join(folderPath, file);
                    const stat = await fse.stat(originalFilePath);
                    if (stat.isFile()) {
                        const clonedFileName = addCloneSuffixBeforeExtension(file);
                        const cloneFilePath = path.join(cloneFolderPath, clonedFileName);
                        await fse.copy(originalFilePath, cloneFilePath);
                    }
                }

                vscode.window.showInformationMessage(`SFClone: Folder cloned to ${cloneFolderName}`);
            } else {
                const ext = path.extname(filePath);
                const baseName = path.basename(filePath, ext);
                const cloneName = `${baseName}-clone${ext}`;
                const clonePath = path.join(folderPath, cloneName);

                await fse.copy(filePath, clonePath);

                // Also clone metadata file if exists
                const metaFile = `${filePath}-meta.xml`;
                const metaClonePath = `${clonePath}-meta.xml`;
                if (fs.existsSync(metaFile)) {
                    await fse.copy(metaFile, metaClonePath);
                }

                vscode.window.showInformationMessage(`SFClone: Created clone ${cloneName}`);
            }

            statusBar.text = 'SFClone: Clone complete ✔️';
        } catch (err: any) {
            vscode.window.showErrorMessage(`SFClone: Clone failed – ${err.message}`);
            statusBar.text = 'SFClone: Clone failed ❌';
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

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const folderLabel = label ? `$${label.replace(/[^a-zA-Z0-9-_]/g, '-')}_${timestamp}` : timestamp;

        const backupRootDir = path.join(rootPath, 'SFClone Backup', folderLabel);

        try {
            statusBar.text = 'SFClone: Creating backup...';

            if (userChoice === 'Backup all components (classes,triggers, lwc, aura)') {
                const folders = ['force-app', 'main', 'default'];
                const types = ['classes','triggers','lwc', 'aura'];

                for (const type of types) {
                    const src = path.join(rootPath, ...folders, type);
                    const dest = path.join(backupRootDir, type);
                    if (fs.existsSync(src)) {
                        await copyRecursive(src, dest);
                    }
                }
            } else {
                const filePath = editor.document.uri.fsPath;
                const match = filePath.match(/(lwc|aura|classes|triggers)/);
                const type = match ? match[1] : null;

                if (!type) {
                    vscode.window.showErrorMessage('Only Apex, Triggers, LWC, or Aura components are supported.');
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

            statusBar.text = 'SFClone: Backup complete ✔️';
        } catch (err: any) {
            vscode.window.showErrorMessage(`SFClone: Backup failed – ${err.message}`);
            statusBar.text = 'SFClone: Backup failed ❌';
        }
    });
    const deleteBackupsCommand = vscode.commands.registerCommand('sfclone.deleteBackups', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        const rootPath = workspaceFolders[0].uri.fsPath;
        const backupDir = path.join(rootPath, 'SFClone Backup');
        if (!fs.existsSync(backupDir)) {
            vscode.window.showInformationMessage('SFClone: No backups found to delete.');
            return;
        }
        const confirm = await vscode.window.showWarningMessage(
            'This will permanently delete all backups. Are you sure?',
            { modal: true },
            'Yes'
        );
        if (confirm === 'Yes') {
            await fse.remove(backupDir);
            vscode.window.showInformationMessage('SFClone: All backups deleted.');
        }
    });
    const restoreBackupCommand = vscode.commands.registerCommand('sfclone.restoreBackup', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const backupRoot = path.join(rootPath, 'SFClone Backup');

        if (!fs.existsSync(backupRoot)) {
            vscode.window.showErrorMessage('No backups found in "SFClone Backup" folder.');
            return;
        }

        const backups = await fse.readdir(backupRoot);
        if (!backups.length) {
            vscode.window.showErrorMessage('No backup folders available to restore.');
            return;
        }

        const selectedBackup = await vscode.window.showQuickPick(backups, {
            placeHolder: 'Select a backup to restore',
        });

        if (!selectedBackup) return;

        const selectedBackupPath = path.join(backupRoot, selectedBackup);
        const componentTypes = ['classes', 'lwc', 'aura', 'triggers'];

        try {
            for (const type of componentTypes) {
                const sourceTypePath = path.join(selectedBackupPath, type);
                const destTypePath = path.join(rootPath, 'force-app', 'main', 'default', type);

                if (fs.existsSync(sourceTypePath)) {
                    await fse.copy(sourceTypePath, destTypePath, { overwrite: true });
                }
            }

            vscode.window.showInformationMessage(`SFClone: Backup "${selectedBackup}" restored successfully.`);
            statusBar.text = 'SFClone: Restore complete ✔️';
        } catch (err: any) {
            vscode.window.showErrorMessage(`SFClone: Restore failed – ${err.message}`);
            statusBar.text = 'SFClone: Restore failed ❌';
        }
    });

    context.subscriptions.push(cloneCommand, backupCommand, deleteBackupsCommand, restoreBackupCommand, statusBar);
}

function addCloneSuffixBeforeExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) return filename; // no extension

    if (filename.endsWith('-meta.xml')) {
        const metaBase = filename.substring(0, filename.length - '-meta.xml'.length);
        const parts = metaBase.split('.');
        const ext = parts.pop();
        return `${parts.join('.')}-clone.${ext}-meta.xml`;
    }

    const ext = parts.pop();
    return `${parts.join('.')}-clone.${ext}`;
}

async function copyRecursive(src: string, dest: string) {
    if (fs.existsSync(src)) {
        await fse.copy(src, dest);
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

    const ext = path.extname(src);
    if (ext === '.cls' || ext === '.trigger') {
        const metaFile = `${src}-meta.xml`;
        const metaDest = `${dest}-meta.xml`;
        if (fs.existsSync(metaFile)) {
            await fse.copy(metaFile, metaDest);
        }
    }
}
function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

export function deactivate() { }
