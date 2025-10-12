'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Site-Wide Logic (Theme Management) ---
    // This part runs on every page that includes this script.
    const themeToggle = document.getElementById('themeToggle');

    function toggleTheme() {
        if (!themeToggle) return;
        const newTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        themeToggle.querySelector('.material-icons-round').textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
    }

    function loadTheme() {
        if (!themeToggle) return;
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        themeToggle.querySelector('.material-icons-round').textContent = savedTheme === 'light' ? 'dark_mode' : 'light_mode';
    }

    // Initialize site-wide features
    loadTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // --- Tool-Specific Logic ---
    // This part only runs on pages where the tool's main container exists (e.g., tool.html).
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {

        // --- Core Application State ---
        let extractedFiles = [];
        let currentZipUrl = null; // To hold the generated ZIP blob URL for reuse

        // --- DOM Element Cache ---
        const dom = {
            appTitle: document.querySelector('.app-title'),
            resetApp: document.getElementById('resetApp'),
            uploadArea: uploadArea, // Use the already queried element
            fileInput: document.getElementById('fileInput'),
            pasteArea: document.getElementById('pasteArea'),
            filesGrid: document.getElementById('resultsSection'),
            downloadAllFab: document.getElementById('downloadZipBtn'),
            shareBtn: document.getElementById('shareBtn'),
            uploadSection: document.getElementById('uploadSection'),
            toast: document.getElementById('snackbar'),
            // --- Download Modal Elements ---
            downloadPopup: document.getElementById('downloadPopup'),
            downloadZipLink: document.querySelector('#downloadPopup .button-primary'),
            copyLinkBtnPopup: document.getElementById('copyLinkBtnPopup'),
            viewFilesBtn: document.getElementById('viewFilesBtn'),
            shareToolBtnPopup: document.getElementById('shareToolBtnPopup'),
            // --- Share Modal Elements ---
            shareModal: document.getElementById('shareModal'),
            closeShareModalBtn: document.getElementById('closeShareModalBtn'),
            copyLinkBtn: document.getElementById('copyLinkBtn'),
            // --- Lead Capture (Email) Modal Elements ---
            zipCodeModal: document.getElementById('zipCodeModal'), // Note: Now used for email capture
            closeZipCodeModalBtn: document.getElementById('closeZipCodeModalBtn'),
            submitZipCodeBtn: document.getElementById('submitZipCodeBtn'),
            zipCodeInput: document.getElementById('zipCodeInput'), // Note: Now an email input
            zipCodeError: document.getElementById('zipCodeError'),
        };
        
        // --- Initialization ---
        function init() {
            setupEventListeners();
        }

        // --- Event Listener Setup ---
        function setupEventListeners() {
            // Drag and Drop / File Input
            if (dom.uploadArea) {
                dom.uploadArea.addEventListener('click', () => dom.fileInput.click());
                dom.uploadArea.addEventListener('dragover', e => { e.preventDefault(); dom.uploadArea.classList.add('dragover'); });
                dom.uploadArea.addEventListener('dragleave', () => dom.uploadArea.classList.remove('dragover'));
                dom.uploadArea.addEventListener('drop', handleFileDrop);
            }
            if (dom.fileInput) {
                dom.fileInput.addEventListener('change', e => handleFileUpload(e.target.files[0]));
            }

            // Main Actions
            if (dom.pasteArea) {
                dom.pasteArea.addEventListener('paste', () => setTimeout(() => parseContent(dom.pasteArea.value), 0));
            }
            if (dom.downloadAllFab) {
                dom.downloadAllFab.addEventListener('click', downloadAllFilesAsZip);
            }
            
            // App Reset
            if (dom.resetApp) {
                dom.resetApp.addEventListener('click', resetApplication);
            }
            if (dom.appTitle) {
                dom.appTitle.style.cursor = 'pointer';
                dom.appTitle.addEventListener('click', resetApplication);
            }
            
            // UI Controls
            if (dom.shareBtn) {
                dom.shareBtn.addEventListener('click', showShareModal);
            }
            
            // Modals
            if (dom.copyLinkBtnPopup) {
                dom.copyLinkBtnPopup.addEventListener('click', (e) => handleCopyLink(e.currentTarget));
            }
            if (dom.shareModal) {
                dom.closeShareModalBtn.addEventListener('click', hideShareModal);
                dom.shareModal.addEventListener('click', (e) => {
                    if (e.target === dom.shareModal) hideShareModal();
                });
                dom.copyLinkBtn.addEventListener('click', (e) => handleCopyLink(e.currentTarget));
            }
            
            // Efficient Event Delegation for dynamic content
            if (dom.filesGrid) {
                dom.filesGrid.addEventListener('click', handleGridClick);
            }

            // Email Capture Modal Listeners (formerly ZIP Code)
            if (dom.zipCodeModal) {
                dom.closeZipCodeModalBtn.addEventListener('click', hideZipCodeModal);
                dom.submitZipCodeBtn.addEventListener('click', handleSubmitEmail);
                dom.zipCodeModal.addEventListener('click', (e) => {
                    if (e.target === dom.zipCodeModal) {
                        hideZipCodeModal();
                    }
                });
                dom.zipCodeInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitEmail();
                    }
                });
                // Clear error state when user starts typing
                dom.zipCodeInput.addEventListener('input', () => {
                    if (dom.zipCodeInput.classList.contains('invalid')) {
                        dom.zipCodeInput.classList.remove('invalid');
                        dom.zipCodeError.style.display = 'none';
                    }
                });
            }
        }

        // --- File Handling & Parsing ---
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
                showToast(`File "${file.name}" loaded. Ready to process.`, 'success');
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
                showToast('Input is empty. Please paste content or upload a file.', 'error');
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
                showToast('No extractable code blocks found. Please check the input format.', 'error');
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
            showToast(`✨ Success! Extracted ${extractedFiles.length} files.`, 'success');
            dom.uploadSection.style.display = 'none';
            dom.filesGrid.style.display = 'grid';
            dom.filesGrid.classList.add('files-grid');
            dom.downloadAllFab.style.display = 'flex';
            downloadAllFilesAsZip(); // Automatically trigger the ZIP creation and show the download modal.
        }

        function resetApplication(e) {
            if (e) e.preventDefault();

            // 1. Reset state variables
            extractedFiles = [];
            if (currentZipUrl) {
                URL.revokeObjectURL(currentZipUrl);
                currentZipUrl = null;
            }

            // 2. Reset UI elements to initial state
            dom.uploadSection.style.display = 'flex';
            dom.filesGrid.style.display = 'none';
            dom.filesGrid.innerHTML = '';
            dom.downloadAllFab.style.display = 'none';
            
            // 3. Reset form inputs
            dom.pasteArea.value = '';
            dom.fileInput.value = null;

            // 4. UX: Scroll to top and show a confirmation toast
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('Ready for a new task!', 'success');
        }

        // --- Dynamic UI Rendering ---
        function displayFiles() {
            const filesToDisplay = extractedFiles;

            if (filesToDisplay.length === 0) {
                dom.filesGrid.innerHTML = `<div class="empty-state">
                    <span class="material-icons-round">search_off</span>
                    <h3>No Files Found</h3>
                    <p>No code blocks were detected in your input. Please try again with a different format.</p>
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
                        <button class="action-button secondary copy-btn" title="Copy Code"><span class="material-icons-round">content_copy</span>Copy</button>
                        <button class="action-button secondary preview-btn" title="Preview Code"><span class="material-icons-round">visibility</span>Preview</button>
                        <button class="action-button download-btn" title="Download File"><span class="material-icons-round">download</span>Download</button>
                    </div>
                    <div class="code-preview"><pre><code class="language-${language}">${escapeHtml(file.content)}</code></pre></div>
                </div>`;
        }

        // --- Delegated Event Handler ---
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
                if (codeBlock && !codeBlock.dataset.highlighted) {
                    hljs.highlightElement(codeBlock);
                    codeBlock.dataset.highlighted = 'true';
                }
            }
        }

        // --- File Actions ---
        async function copyFileContent(file, button) {
            try {
                await navigator.clipboard.writeText(file.content);
                showToast(`Copied "${file.name}" to clipboard.`, 'success');
                
                // Provide visual feedback on the button
                const icon = button.querySelector('.material-icons-round');
                const originalIcon = icon.textContent;
                const originalText = button.childNodes[1].nodeValue; // "Copy" text node
                
                icon.textContent = 'check';
                button.childNodes[1].nodeValue = 'Copied';
                button.disabled = true;

                setTimeout(() => {
                    icon.textContent = originalIcon;
                    button.childNodes[1].nodeValue = originalText;
                    button.disabled = false;
                }, 2000);

            } catch (err) {
                showToast('Could not copy to clipboard.', 'error');
                console.error('Clipboard API error:', err);
            }
        }

        function downloadFile(file) {
            const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
            a.click();
            URL.revokeObjectURL(url);
            showToast(`Downloading "${file.name}"...`, 'success');
        }

        async function downloadAllFilesAsZip() {
            if (extractedFiles.length === 0) return;
            showToast('Preparing your ZIP file...', 'success');
            const zip = new JSZip();
            extractedFiles.forEach(file => zip.file(file.name, file.content));
            
            const content = await zip.generateAsync({ type: 'blob' });
            
            // Revoke the old URL if it exists, to prevent memory leaks
            if (currentZipUrl) {
                URL.revokeObjectURL(currentZipUrl);
            }
            
            currentZipUrl = URL.createObjectURL(content);
            const filename = 'extracted_code.zip';

            showCommercialDownloadPopup(currentZipUrl, filename);
        }

        // --- Download Modal Logic ---
        let popupOverlayClickHandler;
        let popupDownloadClickHandler;
        let popupViewFilesClickHandler;
        let popupShareClickHandler;

        function showCommercialDownloadPopup(zipUrl, zipName) {
            if (!dom.downloadPopup || !dom.downloadZipLink || !dom.viewFilesBtn || !dom.shareToolBtnPopup) return;

            // Configure the download link
            dom.downloadZipLink.href = zipUrl;
            dom.downloadZipLink.download = zipName;

            // Show the popup
            dom.downloadPopup.style.display = 'flex';
            requestAnimationFrame(() => {
                dom.downloadPopup.classList.add('visible');
            });

            // Define handlers
            popupDownloadClickHandler = () => {
                showToast('Your ZIP download has started!', 'success');
                // After download is initiated, display the lead capture modal.
                setTimeout(showZipCodeModal, 2500);
                hideCommercialDownloadPopup();
            };
            
            popupOverlayClickHandler = (e) => {
                if (e.target === dom.downloadPopup) {
                    hideCommercialDownloadPopup();
                }
            };

            popupViewFilesClickHandler = () => {
                hideCommercialDownloadPopup();
            };

            popupShareClickHandler = () => {
                hideCommercialDownloadPopup();
                // A small delay can make the transition smoother
                setTimeout(showShareModal, 150);
            };

            // Add listeners
            dom.downloadZipLink.addEventListener('click', popupDownloadClickHandler);
            dom.downloadPopup.addEventListener('click', popupOverlayClickHandler);
            dom.viewFilesBtn.addEventListener('click', popupViewFilesClickHandler);
            dom.shareToolBtnPopup.addEventListener('click', popupShareClickHandler);
        }

        function hideCommercialDownloadPopup() {
            if (!dom.downloadPopup) return;

            // The URL is no longer revoked here to allow reuse in the next modal.
            // It will be revoked when a new ZIP is generated.

            // Hide the popup
            dom.downloadPopup.classList.remove('visible');
            dom.downloadPopup.addEventListener('transitionend', () => {
                if (dom.downloadPopup) {
                    dom.downloadPopup.style.display = 'none';
                }
            }, { once: true });

            // Clean up listeners
            if (dom.downloadZipLink) dom.downloadZipLink.removeEventListener('click', popupDownloadClickHandler);
            dom.downloadPopup.removeEventListener('click', popupOverlayClickHandler);
            if (dom.viewFilesBtn) dom.viewFilesBtn.removeEventListener('click', popupViewFilesClickHandler);
            if (dom.shareToolBtnPopup) dom.shareToolBtnPopup.removeEventListener('click', popupShareClickHandler);
        }

        async function handleCopyLink(button) {
            if (!button) return;
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Share link copied to clipboard!', 'success');

                const originalContent = button.innerHTML;
                button.innerHTML = `<span class="material-icons-round">check</span> Copied`;
                button.disabled = true;

                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                }, 2500);

            } catch (err) {
                showToast('Could not copy the link.', 'error');
                console.error('Clipboard API error:', err);
            }
        }

        // --- Share Modal ---
        function showShareModal() {
            if (!dom.shareModal) return;
            dom.shareModal.style.display = 'flex';
            requestAnimationFrame(() => {
                dom.shareModal.classList.add('visible');
            });
        }

        function hideShareModal() {
            if (!dom.shareModal) return;
            dom.shareModal.classList.remove('visible');
            dom.shareModal.addEventListener('transitionend', () => {
                if (dom.shareModal) {
                    dom.shareModal.style.display = 'none';
                }
            }, { once: true });
        }

        // --- Lead Capture Modal ---
        function showZipCodeModal() {
            // Display modal only once per session to avoid being intrusive.
            if (sessionStorage.getItem('zipModalShown') || !dom.zipCodeModal) return;

            dom.zipCodeModal.style.display = 'flex';
            requestAnimationFrame(() => {
                dom.zipCodeModal.classList.add('visible');
                dom.zipCodeInput.focus();
            });
            sessionStorage.setItem('zipModalShown', 'true');
        }

        function hideZipCodeModal() {
            if (!dom.zipCodeModal) return;
            dom.zipCodeModal.classList.remove('visible');
            dom.zipCodeModal.addEventListener('transitionend', () => {
                if (dom.zipCodeModal) {
                    dom.zipCodeModal.style.display = 'none';
                    // Reset the form for a clean state on next open.
                    dom.zipCodeInput.value = '';
                    dom.zipCodeInput.classList.remove('invalid');
                    if (dom.zipCodeError) dom.zipCodeError.style.display = 'none';
                }
            }, { once: true });
        }

        function handleSubmitEmail() {
            const email = dom.zipCodeInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(email)) {
                console.log(`Email submitted: ${email}`);
                showToast('Thank you for subscribing!', 'success');
                
                const modalContentEl = dom.zipCodeModal.querySelector('.modal-content');
                if (!modalContentEl) return;

                const downloadButtonHTML = currentZipUrl
                    ? `<a href="${currentZipUrl}" download="extracted_code.zip" class="action-button" style="margin-top: 24px; justify-content: center; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto;">
                           <span class="material-icons-round">download</span>
                           Download Your Files Again
                       </a>`
                    : '';

                const thankYouContent = `
                    <button class="modal-close-btn" title="Close">
                        <span class="material-icons-round">close</span>
                    </button>
                    <div style="text-align: center;">
                        <span class="material-icons-round" style="font-size: 48px; color: var(--md-sys-color-primary); margin-bottom: 16px; display: block;">check_circle</span>
                        <h2 style="text-align: center; margin-top: 0; font-size: 1.5rem; font-weight: 500; color: var(--md-sys-color-on-surface);">Subscription Confirmed!</h2>
                        <p style="text-align: center; margin-top: 8px; margin-bottom: 24px; color: var(--md-sys-color-on-surface-variant);">You'll be the first to know about new features and tools.</p>
                        <div class="modal-actions" style="justify-content: center;">
                            ${downloadButtonHTML}
                        </div>
                    </div>
                `;
                modalContentEl.innerHTML = thankYouContent;

                modalContentEl.querySelector('.modal-close-btn').addEventListener('click', hideZipCodeModal);
            } else {
                dom.zipCodeInput.classList.add('invalid');
                dom.zipCodeError.style.display = 'block';
                dom.zipCodeInput.focus();
            }
        }

        // --- Utility Functions ---
        function showToast(message, type = 'success') {
            if (!dom.toast) return;
            dom.toast.className = `toast ${type}`;
            const iconName = type === 'success' ? 'check_circle' : 'error';
            dom.toast.innerHTML = `<span class="material-icons-round">${iconName}</span><span>${message}</span>`;
            dom.toast.classList.add('show');
            setTimeout(() => {
                dom.toast.classList.remove('show');
            }, 3000);
        }

        // --- Helpers ---
        const getFileIcon = ext => ({ js: 'javascript', ts: 'code', py: 'code', java: 'code', html: 'html', css: 'style', json: 'data_object', md: 'description', sql: 'storage', sh: 'terminal' }[ext.toLowerCase()] || 'description');
        const getLanguageClass = ext => ({ js: 'javascript', ts: 'typescript', py: 'python', java: 'java', cs: 'csharp', go: 'go', rs: 'rust', html: 'xml', css: 'css', json: 'json', sql: 'sql', sh: 'bash', md: 'markdown' }[ext.toLowerCase()] || 'plaintext');
        const escapeHtml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // --- Start The App ---
        init();
    }
});