export function cleanText(text) {
    return text
        // Remove PDF page-number artifacts like "-- 1 of 1 --"
        .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
        
        // Remove extra whitespace and newlines
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}