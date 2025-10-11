'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ===== CONFIGURATION & STATE =====
    const socialLinks = {
        Instagram: "https://www.instagram.com/icraft_now/",
        Twitter: "https://x.com/icraft_now",
        TikTok: "https://www.tiktok.com/@icraftnow",
        Telegram: "https://t.me/icraftnow_bot",
        Facebook: "https://www.facebook.com/profile.php?id=61580835406672",
        GitHub: "https://github.com/iCraftNow/M",
    };
    let extractedFiles = [];

    // ===== DOM ELEMENT REFERENCES =====
    const dom = {
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        pasteArea: document.getElementById('pasteArea'),
        filesGrid: document.getElementById('resultsSection'),
        downloadAllFab: document.getElementById('downloadZipBtn'),
        themeToggle: document.getElementById('themeToggle'),
        shareBtn: document.getElementById('shareBtn'),
        uploadSection: document.getElementById('uploadSection'),
        toast: document.getElementById('snackbar'),
        mainFooter: null, // Created dynamically
    };
    
    // ===== INITIALIZATION =====
    function init() {
        setupEventListeners();
        loadTheme();
        createAndGenerateFooter();
    }

    // ===== EVENT LISTENERS SETUP =====
    function setupEventListeners() {
        // Drag and Drop / File Input
        dom.uploadArea.addEventListener('click', () => dom.fileInput.click());
        dom.uploadArea.addEventListener('dragover', e => { e.preventDefault(); dom.uploadArea.classList.add('dragover'); });
        dom.uploadArea.addEventListener('dragleave', () => dom.uploadArea.classList.remove('dragover'));
        dom.uploadArea.addEventListener('drop', handleFileDrop);
        dom.fileInput.addEventListener('change', e => handleFileUpload(e.target.files[0]));

        // Main Actions
        dom.pasteArea.addEventListener('paste', () => setTimeout(() => parseContent(dom.pasteArea.value), 0));
        dom.downloadAllFab.addEventListener('click', showDownloadModal);
        
        // UI Controls
        dom.themeToggle.addEventListener('click', toggleTheme);
        dom.shareBtn.addEventListener('click', shareTool);
        
        // Efficient Event Delegation for dynamic content
        dom.filesGrid.addEventListener('click', handleGridClick);
    }

    // ===== FILE HANDLING & PARSING =====
    function handleFileDrop(e) {
        e.preventDefault();
        dom.uploadArea.classList.remove('dragover');
        handleFileUpload(e.dataTransfer.files[0]);
    }
    
    function handleFileUpload(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            dom.pasteArea.value = e.target.result;
            showToast(`Unfurled ${file.name}`, 'success');
            parseContent(e.target.result);
        };
        reader.readAsText(file);
    }

    /**
     * Intelligent parser that handles multiple formats:
     * 1. Custom Delimiter: `========== File Start: ...`
     * 2. Simple Delimiter: `File: ... ---`
     * 3. Standard Markdown: ```language:filename
     */
    function parseContent(content) {
        if (!content.trim()) {
            showToast('Please provide content to unfurl.', 'error');
            return;
        }

        let files = [];
        let remainingContent = content;

        // 1. Parse custom delimiter format
        const customDelimiterRegex = /=+\s*File Start:\s*(.+?)\s*=+\s*\n([\s\S]*?)\n=+\s*File End:\s*\1\s*=+?/gi;
        remainingContent = remainingContent.replace(customDelimiterRegex, (match, fileName, fileContent) => {
            files.push({ name: fileName.trim(), content: fileContent.trim() });
            return ''; // Remove matched block
        });

        // 2. Parse simple "File: ..." format
        const simpleFileRegex = /(?:^|\n)File:\s*(.+?)\n([\s\S]*?)\n---/g;
        remainingContent = remainingContent.replace(simpleFileRegex, (match, fileName, fileContent) => {
            files.push({ name: fileName.trim(), content: fileContent.trim() });
            return ''; // Remove matched block
        });

        // 3. Parse standard markdown fence format on remaining content
        const markdownRegex = /```(\S*)\n([\s\S]*?)\n```/g;
        let match;
        while ((match = markdownRegex.exec(remainingContent)) !== null) {
            const languageOrName = match[1].trim();
            const fileContent = match[2].trim();
            if (!fileContent) continue;

            const fileName = languageOrName.includes('.') || languageOrName.includes('/')
                ? languageOrName
                : `file-${files.length + 1}.${languageOrName || 'txt'}`;
            
            files.push({ name: fileName, content: fileContent });
        }

        if (files.length === 0) {
            showToast('No code blocks found to unfurl. Check the format.', 'error');
            return;
        }

        // Process and enrich file data
        extractedFiles = files.map(file => ({
            ...file,
            id: file.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substr(2, 9),
            extension: file.name.split('.').pop() || 'txt',
            size: new Blob([file.content]).size,
            lines: file.content.split('\n').length,
        }));

        updateUIOnSuccess();
    }
    
    function updateUIOnSuccess() {
        displayFiles();
        showToast(`✨ Unfurled ${extractedFiles.length} files successfully!`, 'success');
        dom.uploadSection.style.display = 'none';
        dom.filesGrid.style.display = 'grid';
        dom.filesGrid.classList.add('files-grid');
        dom.downloadAllFab.style.display = 'flex';
        showDownloadModal(); // Directly show download options after parsing
    }

    // ===== DYNAMIC UI RENDERING =====
    function displayFiles() {
        const filesToDisplay = extractedFiles;

        if (filesToDisplay.length === 0) {
            dom.filesGrid.innerHTML = `<div class="empty-state">
                <span class="material-icons-round">search_off</span>
                <h3>No Files Found</h3>
                <p>We couldn't find any code blocks to unfurl. Check your format.</p>
            </div>`;
            dom.filesGrid.classList.remove('files-grid');
            dom.filesGrid.style.display = 'block';
        } else {
            dom.filesGrid.innerHTML = filesToDisplay.map(createFileCardHTML).join('');
            dom.filesGrid.classList.add('files-grid');
            dom.filesGrid.style.display = 'grid';
        }
    }

    function createFileCardHTML(file) {
        const icon = getFileIcon(file.extension);
        const language = getLanguageClass(file.extension);
        const sizeKB = (file.size / 1024).toFixed(2);
        let firstLine = (file.content.split('\n')[0] || '').trim();
        if (firstLine.length > 100) {
            firstLine = firstLine.substring(0, 100) + '...';
        }
        firstLine = escapeHtml(firstLine);

        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-card-header">
                    <div class="file-icon"><span class="material-icons-round">${icon}</span></div>
                    <div class="file-info">
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-meta">
                            <span class="file-ext">${file.extension.toUpperCase()}</span>
                            <span>${sizeKB} KB</span>
                            <span>${file.lines} lines</span>
                        </div>
                    </div>
                </div>
                <div class="first-line-preview">
                    <code>${firstLine || '&nbsp;'}</code>
                </div>
                <div class="file-actions">
                    <button class="action-button secondary copy-btn" title="Copy content"><span class="material-icons-round">content_copy</span>Copy</button>
                    <button class="action-button secondary preview-btn" title="Preview content"><span class="material-icons-round">visibility</span>Preview</button>
                    <button class="action-button download-btn" title="Download file"><span class="material-icons-round">download</span>Download</button>
                </div>
                <div class="code-preview"><pre><code class="language-${language}">${escapeHtml(file.content)}</code></pre></div>
            </div>`;
    }

    // ===== DELEGATED EVENT HANDLER =====
    function handleGridClick(e) {
        const card = e.target.closest('.file-card');
        if (!card) return;

        const file = extractedFiles.find(f => f.id === card.dataset.fileId);
        if (!file) return;

        if (e.target.closest('.preview-btn') || e.target.closest('.file-card-header')) {
            togglePreview(card);
        } else if (e.target.closest('.download-btn')) {
            downloadFile(file);
        } else if (e.target.closest('.copy-btn')) {
            copyFileContent(file, e.target.closest('.copy-btn'));
        }
    }

    function togglePreview(cardElement) {
        const isExpanded = cardElement.classList.toggle('expanded');
        if (isExpanded) {
            const codeBlock = cardElement.querySelector('code');
            if (!codeBlock.dataset.highlighted) {
                hljs.highlightElement(codeBlock);
                codeBlock.dataset.highlighted = 'true';
            }
        }
    }

    // ===== FILE ACTIONS =====
    async function copyFileContent(file, button) {
        try {
            await navigator.clipboard.writeText(file.content);
            showToast(`Copied ${file.name} to clipboard!`, 'success');
            
            // Visual feedback on the button
            const icon = button.querySelector('.material-icons-round');
            const originalIcon = icon.textContent;
            const originalText = button.childNodes[1].nodeValue; // "Copy" text node
            
            icon.textContent = 'check';
            button.childNodes[1].nodeValue = 'Copied!';
            button.disabled = true;

            setTimeout(() => {
                icon.textContent = originalIcon;
                button.childNodes[1].nodeValue = originalText;
                button.disabled = false;
            }, 2000);

        } catch (err) {
            showToast('Failed to copy content.', 'error');
            console.error('Clipboard API error:', err);
        }
    }

    function downloadFile(file) {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
        a.click();
        URL.revokeObjectURL(url);
        showToast(`📥 Saved ${file.name}`, 'success');
    }

    async function downloadAllFilesAsZip(filename = 'unfurl-files.zip') {
        if (extractedFiles.length === 0) return;
        showToast('Bundling files into a ZIP...', 'success');
        const zip = new JSZip();
        extractedFiles.forEach(file => zip.file(file.name, file.content));
        
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        a.click();
        URL.revokeObjectURL(url);
        showToast(`📦 Saved ${extractedFiles.length} files as a ZIP!`, 'success');
    }

    // ===== DOWNLOAD MODAL =====
    function createModalStyles() {
        if (document.getElementById('unfurl-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'unfurl-modal-styles';
        style.innerHTML = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(4px);
            }
            .modal-overlay.visible {
                opacity: 1;
            }
            .modal-content {
                background-color: var(--unfurl-color-surface);
                padding: 32px;
                border-radius: var(--unfurl-radius-lg);
                box-shadow: var(--unfurl-shadow-xl);
                width: 90%;
                max-width: 500px;
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            .modal-overlay.visible .modal-content {
                transform: scale(1);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            }
            .modal-header h2 {
                font-size: 22px;
                font-weight: 600;
                color: var(--unfurl-color-text);
            }
            .modal-body .form-group {
                margin-bottom: 20px;
            }
            .modal-body label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--unfurl-color-text-muted);
            }
            .modal-body input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid var(--unfurl-color-border);
                border-radius: var(--unfurl-radius-md);
                background-color: var(--unfurl-color-input-bg);
                color: var(--unfurl-color-text);
                font-size: 16px;
                font-family: var(--unfurl-font-sans);
            }
            .modal-body input:focus {
                outline: none;
                border-color: var(--unfurl-color-primary);
                box-shadow: 0 0 0 3px color-mix(in srgb, var(--unfurl-color-primary) 20%, transparent);
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 32px;
            }
        `;
        document.head.appendChild(style);
    }

    function showDownloadModal() {
        if (extractedFiles.length === 0) return;
        createModalStyles();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'downloadModalOverlay';

        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Download Options</h2>
                    <button class="md-icon-button" id="closeModalBtn" title="Close">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="zipFilename">ZIP Filename</label>
                        <input type="text" id="zipFilename" value="unfurl-files.zip">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-button secondary" id="cancelDownloadBtn">Cancel</button>
                    <button class="action-button" id="confirmDownloadBtn">
                        <span class="material-icons-round">archive</span>
                        Download ZIP
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        
        requestAnimationFrame(() => {
            modalOverlay.classList.add('visible');
        });

        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            modalOverlay.addEventListener('transitionend', () => {
                if (modalOverlay.parentElement) {
                    modalOverlay.parentElement.removeChild(modalOverlay);
                }
            }, { once: true });
        };

        document.getElementById('closeModalBtn').addEventListener('click', closeModal);
        document.getElementById('cancelDownloadBtn').addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.getElementById('confirmDownloadBtn').addEventListener('click', () => {
            const filenameInput = document.getElementById('zipFilename');
            let filename = filenameInput.value.trim();
            if (filename && !filename.toLowerCase().endsWith('.zip')) {
                filename += '.zip';
            }
            downloadAllFilesAsZip(filename || 'unfurl-files.zip');
            closeModal();
        });
        
        const filenameInput = document.getElementById('zipFilename');
        filenameInput.focus();
        filenameInput.select();
        filenameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('confirmDownloadBtn').click();
            }
        });
    }

    // ===== FOOTER =====
    function createAndGenerateFooter() {
        const footer = document.createElement('footer');
        footer.id = 'main-footer';
        document.body.appendChild(footer);
        dom.mainFooter = footer;
        generateFooter();
    }

    function generateFooter() {
        const socialHTML = Object.entries(socialLinks)
            .map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`)
            .join('');
        dom.mainFooter.innerHTML = `
            <div class="social-links">${socialHTML}</div>
            <p class="footer-credit">Made with <span class="heart">❤️</span> by <a href="https://icraftnow.com/" target="_blank" rel="noopener noreferrer">IcraftNow</a></p>
            <div style="margin-top: 16px;">
                <a href="https://icraftnow.com/tools/" target="_blank" rel="noopener noreferrer" class="md-button">
                    <span class="material-icons-round">construction</span>
                    More Tools
                </a>
            </div>`;
    }

    // ===== UTILITY & THEME FUNCTIONS =====
    function showToast(message, type = 'success') {
        dom.toast.className = `toast ${type}`;
        const iconName = type === 'success' ? 'check_circle' : 'error';
        dom.toast.innerHTML = `<span class="material-icons-round">${iconName}</span><span>${message}</span>`;
        dom.toast.classList.add('show');
        setTimeout(() => {
            dom.toast.classList.remove('show');
        }, 3000);
    }

    async function shareTool() {
        const shareData = { title: document.title, text: 'Stop manually copying code from LLM chats! Unfurl extracts all files instantly.', url: window.location.href };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showToast('Thanks for spreading the word!', 'success');
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!', 'success');
            }
        } catch (err) {
            showToast('Could not share. Please copy the URL manually.', 'error');
        }
    }

    function toggleTheme() {
        const newTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        dom.themeToggle.querySelector('.material-icons-round').textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        dom.themeToggle.querySelector('.material-icons-round').textContent = savedTheme === 'light' ? 'dark_mode' : 'light_mode';
    }

    // ===== HELPERS =====
    const getFileIcon = ext => ({ js: 'javascript', ts: 'code', py: 'code', java: 'code', html: 'html', css: 'style', json: 'data_object', md: 'description', sql: 'storage', sh: 'terminal' }[ext.toLowerCase()] || 'description');
    const getLanguageClass = ext => ({ js: 'javascript', ts: 'typescript', py: 'python', java: 'java', cs: 'csharp', go: 'go', rs: 'rust', html: 'xml', css: 'css', json: 'json', sql: 'sql', sh: 'bash', md: 'markdown' }[ext.toLowerCase()] || 'plaintext');
    const escapeHtml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // ===== START THE APP =====
    init();
});