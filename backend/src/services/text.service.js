
export function cleanText(text) {
    // Remove extra whitespace and newlines
    return text
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}