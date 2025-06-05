# 🌟 SFClone – Effortless Salesforce Component Backups & Clones in VS Code

A simple, elegant VS Code extension to back up, clone, restore, and delete your Salesforce Apex, LWC, and Aura components with just one click. Ideal for versioning, prototyping, pre-deployment snapshots, and peace of mind.

---

## 🚀 Features

- 📁 **Backup current file or entire component folders**
- 🧠 **Smart detection:**
  - For **LWC/Aura**: backs up the full component folder
  - For **Apex**: backs up `.cls`, `.trigger`, and their corresponding `-meta.xml` files
- 🔄 **Clone individual components**:
  - Quickly create editable copies of Apex, LWC, or Aura files/folders
  - Includes `*.cls-meta.xml` and `*.trigger-meta.xml` for Apex components
- 🗄️ **Restore from backup**:
  - Select a previously created backup and copy files back into your workspace
- 🗑️ **Delete all backups**:
  - Warning prompt, then deletes everything under `SFClone Backup/`
- 🕒 **Time-stamped** and optionally **labeled** backups (format: `YYYYMMDD_HHMMSS_label`)
- 📂 Organized in a `/SFClone Backup/` folder
- 🛡️ **Auto-added to `.gitignore`** to avoid polluting version control
- 💻 **No Salesforce login or configuration required**
- 🎁 **Free to use** — Optional donation link below

---

## ✨ Usage

### 🔁 Clone a Component

1. Open any Apex, LWC, or Aura file in your Salesforce DX project.
2. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) → type:
3. The extension will create:
- For **LWC/Aura**: a sibling folder named `<componentName>-clone/`, with _every_ file inside renamed to include `-clone` before its extension (including `*.js-meta.xml` → `*-clone.js-meta.xml`).
- For **Apex** (`.cls` or `.trigger`): a new file in the same folder named `<OriginalName>-clone.cls` (and `<OriginalName>-clone.cls-meta.xml` if applicable).

---

### 📦 Backup a Component

1. Open any file in an Apex, LWC, or Aura component.
2. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) → type:
3. Choose:
- `Backup current file/component`
  • Apex: backs up that single `.cls` / `.trigger` and its `-meta.xml` to
    ```
    <SF Project Root>/SFClone Backup/YYYYMMDD_HHMMSS_<optionalLabel>/classes/
    ```
  • LWC/Aura: backs up the entire component folder under
    ```
    <SF Project Root>/SFClone Backup/YYYYMMDD_HHMMSS_<optionalLabel>/lwc|aura/<componentName>/
    ```
- `Backup all components (classes, lwc, aura)`
  • Copies `/force-app/main/default/classes`, `/lwc`, and `/aura` into
    ```
    <SF Project Root>/SFClone Backup/YYYYMMDD_HHMMSS_<optionalLabel>/{classes,lwc,aura}/
    ```

4. Optionally enter a short label for the backup folder (e.g., `pre-deploy-fix`).

🎉 That’s it! Your backup will be available under:

```bash
<SF Project Root>/SFClone Backup/YYYYMMDD_HHMMSS_<label>
```

---



### 🔄 Restore a Backup


## ✨ Usage

1. Open any Apex, LWC, or Aura file in your Salesforce DX project.
2. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) → type:

   ```
    SFClone: Restore Backup
   ```

3. Select one of the timestamped backup folders (e.g., 20250604_141512_pre-deploy).

   Confirm the warning prompt **(Restoring will overwrite current files. Continue?)**.
   On `Yes`, all files from that backup copy back into your workspace, preserving `classes/, triggers/, lwc/, and aura/` structure.

🎉 That’s it! Your files are restored from the backup:

---

### 🗑️ Delete All Backups

## ✨ Usage

1. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) → type:

   ```
    SFClone: Delete All Backups
   ```

2. Confirm the warning prompt (“This will permanently delete all backups. Are you sure?”).
    On `Yes`, everything under `SFClone Backup/` is deleted.


---

## 📦 Example Structure

```bash
SFClone Backup/
├── 2025-05-31T10-32-00Z_pre-deploy-fix/
│   ├── classes/
│   │   └── MyClass.cls
│   │   └── MyClass.cls-meta.xml
│   ├── triggers/
│   │   └── MyTrigger.trigger
│   │   └── MyTrigger.trigger-meta.xml
│   ├── lwc/
│   │   └── myComponent/
│   └── aura/
│       └── myAuraComp/
```

---

## 📁 Auto `.gitignore`

On first run, the extension checks and auto-appends `/SFClone Backup/` to your project's `.gitignore` file, ensuring your backups aren’t committed to Git.

---

## 💡 Why SFClone?

- 🚫 No external tools or CLI setup required
- 🔄 Great for **ad-hoc backups** before large changes
- 🪶 Lightweight and intuitive
- 🔌 Seamlessly integrates into your dev workflow

---

## 💖 Support & Donations

If this extension helped you, consider supporting its development.

[☕ Buy Me a Coffee](https://www.buymeacoffee.com/manoharsiriki)

---

## 🛠️ Installation

✅ From VS Code Marketplace (Recommended)
Install directly from the VS Code Marketplace:
[🔗 SFClone Extension on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ManoharSiriki.sfclone)

Or run this in the command line:
```bash
ext install ManoharSiriki.sfclone
```

bash
Copy
Edit
ext install ManoharSiriki.sfclone

```bash
git clone https://github.com/your-username/sfclone.git
cd sfclone
npm install
npm run compile
code .
```

---

## 🧠 Author

**Manohar Siriki**
Salesforce Technical Architect | VS Code Enthusiast
[Connect on LinkedIn](https://www.linkedin.com/in/manoharsiriki)
