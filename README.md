# 🗂️ Unfurl - Your AI Chat File Extractor

<div align="center">

<img src="https://raw.githubusercontent.com/iCraftNow/MarkDown-File-Extractor/main/og-image.png" alt="Unfurl Banner" width="800" style="border-radius: 12px; margin-bottom: 20px;" />

![Unfurl Badge](https://img.shields.io/badge/Unfurl-Extract_Files_Instantly-4A90E2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn5eyPC90ZXh0Pjwvc3ZnPg==)

[![Live Demo](https://img.shields.io/badge/🚀_Try_It_Now-Live_Demo-50E3C2?style=for-the-badge)](https://icraftnow.github.io/MarkDown-File-Extractor/)
[![GitHub Stars](https://img.shields.io/github/stars/iCraftNow/MarkDown-File-Extractor?style=for-the-badge&logo=github&color=FFD700)](https://github.com/iCraftNow/MarkDown-File-Extractor/stargazers)
[![Made by iCraftNow](https://img.shields.io/badge/Made_by-iCraftNow-FF6B6B?style=for-the-badge&logo=heart)](https://icraftnow.com/)

**Stop the tedious copy-paste dance. Paste your entire LLM chat and Unfurl instantly extracts all code blocks into a downloadable ZIP.** ⚡

[🎯 Use Now](https://icraftnow.github.io/MarkDown-File-Extractor/) • [⭐ Star This Repo](https://github.com/iCraftNow/MarkDown-File-Extractor) • [🛠️ More Tools](https://icraftnow.com/tools/)

</div>

---

## 🎭 The Problem We Solve

Ever finished an epic coding session with ChatGPT, Claude, or Gemini, only to realize you need to manually copy-paste 47 different code blocks? 

**We feel your pain.** 😫

```diff
- Copy code block 1... paste... save as file1.js
- Copy code block 2... paste... save as file2.css
- Copy code block 3... paste... save as file3.html
- Copy code block 4... *falls asleep at keyboard*
+ Paste entire chat → Click → ZIP with all files ✨
```

---

## ✨ Why Developers Love Unfurl

<table>
<tr>
<td width="33%" align="center">
<h3>⚡ Lightning Fast</h3>
<p>From chat to ZIP in <strong>under 2 seconds</strong>. No sign-ups, no APIs, no BS.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Smart Detection</h3>
<p>Automatically recognizes <strong>3+ different</strong> file formats. It just <em>works</em>.</p>
</td>
<td width="33%" align="center">
<h3>🎨 Beautiful UI</h3>
<p>Syntax highlighting, dark mode, and a Material Design interface that <strong>doesn't hurt your eyes</strong>.</p>
</td>
</tr>
<tr>
<td width="33%" align="center">
<h3>🔒 Privacy First</h3>
<p><strong>100% client-side.</strong> Your code never touches our servers. Ever.</p>
</td>
<td width="33%" align="center">
<h3>🎯 Zero Config</h3>
<p>No installation, no dependencies, no "please update Node.js". Just <strong>paste and go</strong>.</p>
</td>
<td width="33%" align="center">
<h3>🌈 Universal</h3>
<p>Works with ChatGPT, Claude, Gemini, and <strong>any markdown</strong> format.</p>
</td>
</tr>
</table>

---

## 🎬 How It Works

```mermaid
graph LR
    A[💬 LLM Chat] -->|Copy| B[📋 Paste into Unfurl]
    B -->|Magic ✨| C[🔍 Smart Parser]
    C -->|Detects| D[📝 Code Blocks]
    C -->|Extracts| E[🗂️ File Names]
    C -->|Preserves| F[💅 Syntax]
    D --> G[📦 Generate ZIP]
    E --> G
    F --> G
    G -->|One Click| H[⬇️ Download All Files]
    
    style A fill:#4A90E2,stroke:#3A7BC8,color:#fff
    style H fill:#50E3C2,stroke:#40D3B2,color:#fff
    style C fill:#FF6B6B,stroke:#EE5B5B,color:#fff
    style G fill:#FFD700,stroke:#EEC700,color:#000
```

---

## 🚀 Quick Start (Literally 3 Steps)

### 1️⃣ Have a Chat with Your Favorite AI

```javascript
// Ask ChatGPT/Claude/Gemini to build something
"Create a simple landing page with HTML, CSS, and JS"
```

### 2️⃣ Copy the Entire Response

Select all → Copy (or just save the chat as markdown)

### 3️⃣ Unfurl It!

**[Open Unfurl](https://icraftnow.github.io/MarkDown-File-Extractor/)** → Paste → Download ZIP

**That's it!** 🎉 All your files are neatly organized and ready to use.

---

## 🎯 Supported Formats

Unfurl is smart enough to detect multiple code block formats:

### Standard Markdown
````markdown
```javascript:app.js
console.log('Hello, World!');
```
````

### File Path Delimiters
```
File: src/index.html
<!DOCTYPE html>
<html>...</html>
---
```

### Custom Delimiters
```
========== File Start: style.css ==========
body { margin: 0; }
========== File End: style.css ==========
```

**Pro tip:** It even works with mixed formats in the same chat! 🤯

---

## 💡 Real-World Use Cases

<details>
<summary><strong>🎓 Learning & Tutorials</strong></summary>

Following a coding tutorial from an AI? Extract all example files instantly instead of copying each snippet.

</details>

<details>
<summary><strong>🏗️ Rapid Prototyping</strong></summary>

Generate a full project structure with AI and have all files ready to run in seconds.

</details>

<details>
<summary><strong>📚 Code Review</strong></summary>

Reviewing AI-generated code? Download everything at once to test locally.

</details>

<details>
<summary><strong>🔧 Debugging Sessions</strong></summary>

Save your debugging conversations as markdown and extract the working solutions later.

</details>

<details>
<summary><strong>📦 Project Templates</strong></summary>

Ask AI to create project boilerplates and extract them as ready-to-use starter kits.

</details>

---

## 🌟 Features That Make You Go "Wow"

- **📂 Drag & Drop Support** - Drop chat logs directly onto the page
- **🎨 Syntax Highlighting** - Preview code with beautiful highlighting (powered by Highlight.js)
- **🌓 Dark/Light Mode** - Because we respect your eyes
- **📱 Mobile Friendly** - Works on phones, tablets, and that weird screen your coworker has
- **⚡ Instant Preview** - See all extracted files before downloading
- **🎯 Smart Naming** - Preserves original filenames or generates sensible ones
- **📊 File Stats** - See file sizes, line counts, and extensions at a glance
- **🔗 Shareable** - One-click sharing to spread the word

---

## 🎨 Screenshots That Don't Lie

<div align="center">

### Light Mode ☀️
*Clean, professional, and easy on the eyes*

### Dark Mode 🌙
*For the night owls and cave dwellers*

### File Preview 👀
*Syntax highlighting that actually works*

</div>

---

## 🛠️ Tech Stack (For the Curious)

Built with love and:

- **Vanilla JavaScript** - No framework bloat, just pure speed
- **Material Design** - Google's design language for a familiar feel
- **Highlight.js** - Beautiful syntax highlighting
- **JSZip** - Reliable ZIP generation
- **100% Client-Side** - Your privacy is sacred

---

## 🤝 Contributing

Found a bug? Have an idea? Want to make Unfurl even better?

1. **⭐ Star this repo** (seriously, it makes our day)
2. **🍴 Fork it** (go wild with your ideas)
3. **🔨 Make it better** (we love pull requests)
4. **🎉 Submit a PR** (we'll review faster than you can say "merge")

---

## 📜 License

MIT License - Feel free to use this in your own projects!

---

## 🎁 More Awesome Tools

Love Unfurl? Check out our other developer tools:

[![More Tools](https://img.shields.io/badge/🛠️_More_Tools-Explore_iCraftNow-4A90E2?style=for-the-badge)](https://icraftnow.com/tools/)

---

## 💬 Connect With Us

<div align="center">

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/icraft_now/)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/icraft_now)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@icraftnow)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/icraftnow_bot)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/profile.php?id=61580835406672)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/iCraftNow/M)

**Made with ❤️ by [iCraftNow](https://icraftnow.com/)**

</div>

---

<div align="center">

## 🎯 Ready to Save Hours of Your Life?

### **[🚀 Try Unfurl Now](https://icraftnow.github.io/MarkDown-File-Extractor/)**

*No installation required. No sign-up. No credit card. Just pure productivity.*

---

**If Unfurl saved you time, show some love with a ⭐**

[![Star History Chart](https://img.shields.io/github/stars/iCraftNow/MarkDown-File-Extractor?style=social)](https://github.com/iCraftNow/MarkDown-File-Extractor/stargazers)

</div>
