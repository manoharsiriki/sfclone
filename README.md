# 🌟 SFClone - Effortless Salesforce Component Backups in VS Code

A simple, elegant VS Code extension to back up your Salesforce Apex, LWC, and Aura components with just one click. Ideal for versioning, pre-deployment snapshots, and peace of mind.

---

## 🚀 Features

- 📁 **Backup current file or entire component folders**
- 🧠 **Smart detection:**
  - For **LWC/Aura**: backs up the full component folder
  - For **Apex**: backs up only the `.cls`, `.trigger`, or related files
- 🕒 **Time-stamped** and optionally **labeled** backups
- 📂 Organized in a `/SFClone Backup/` folder
- 🛡️ **Auto-added to `.gitignore`** to avoid polluting version control
- 💻 **No Salesforce login or configuration required**
- 🎁 **Free to use** — Optional donation link below

---

## ✨ Usage

1. Open any Apex, LWC, or Aura file in your Salesforce DX project.
2. Open **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) → type:

   ```
   SFClone: Clone Components
   ```

3. Choose:
   - `Backup current file/component`
   - `Backup all components (classes, lwc, aura)`

4. Optionally enter a short label for the backup folder (e.g., `pre-deploy-fix`)

🎉 That’s it! Your backup will be available under:

```bash
<SF Project Root>/SFClone Backup/<timestamp>_<label (optional)>
```

---

## 📦 Example Structure

```bash
SFClone Backup/
├── 2025-05-31T10-32-00Z_pre-deploy-fix/
│   ├── classes/
│   │   └── MyClass.cls
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

You can install directly from the **Visual Studio Code Marketplace** (coming soon!)  
Or clone and run locally:

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
