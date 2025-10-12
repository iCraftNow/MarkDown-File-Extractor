/**
 * Intelligent parser that handles multiple formats for extracting file content.
 * It supports:
 * 1. Custom Delimiter: `========== File Start: path/to/file.js ========== ... ========== File End: path/to/file.js ========== `
 * 2. Simple Delimiter: `File: path/to/file.css ... ---`
 * 3. Standard Markdown: ```javascript:path/to/script.js ... 
 *
 * @param {string} content The raw text content to parse.
 * @returns {Array<Object>} An array of extracted file objects, each with enriched metadata.
 */
export function parseContent(content) {
    if (!content || !content.trim()) {
        return [];
    }

    let files = [];
    let remainingContent = content;

    // 1. Parse custom delimiter format
    // Matches blocks like:
    // ========== File Start: path/to/file.js ==========
    // ... content ...
    // ========== File End: path/to/file.js ==========
    const customDelimiterRegex = /=+\s*File Start:\s*(.+?)\s*=+\s*\n([\s\S]*?)\n=+\s*File End:\s*\1\s*=+?/gi;
    remainingContent = remainingContent.replace(customDelimiterRegex, (match, fileName, fileContent) => {
        files.push({ name: fileName.trim(), content: fileContent.trim() });
        return ''; // Remove matched block to avoid re-parsing
    });

    // 2. Parse simple "File: ..." format
    // Matches blocks like:
    // File: path/to/another/file.css
    // ... content ...
    // ---
    const simpleFileRegex = /(?:^|\n)File:\s*(.+?)\n([\s\S]*?)\n---/g;
    remainingContent = remainingContent.replace(simpleFileRegex, (match, fileName, fileContent) => {
        files.push({ name: fileName.trim(), content: fileContent.trim() });
        return ''; // Remove matched block
    });

    // 3. Parse standard markdown fence format on any remaining content
    // Matches blocks like:
    // ```javascript:path/to/script.js
    // ... content ...
    // 
    const markdownRegex = /```(\S*)\n([\s\S]*?)\n```/g;
    let match;
    while ((match = markdownRegex.exec(remainingContent)) !== null) {
        const languageOrName = match[1].trim();
        const fileContent = match[2].trim();
        
        // Skip empty code blocks
        if (!fileContent) continue;

        // Determine the filename. If a path-like string is provided, use it.
        // Otherwise, generate a filename based on the language or a counter.
        const fileName = languageOrName.includes('.') || languageOrName.includes('/')
            ? languageOrName
            : `file-${files.length + 1}.${languageOrName || 'txt'}`;
        
        files.push({ name: fileName, content: fileContent });
    }

    if (files.length === 0) {
        return [];
    }

    // Process and enrich file data before returning
    return files.map(file => ({
        ...file,
        // Generate a unique ID for each file for UI purposes
        id: file.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substr(2, 9),
        extension: file.name.split('.').pop() || 'txt',
        // Calculate size. Blob is more accurate for byte size but is a browser API.
        // Fallback to string length for non-browser environments (like testing).
        size: typeof Blob !== 'undefined' ? new Blob([file.content]).size : file.content.length,
        lines: file.content.split('\n').length,
    }));
}