/**
 * Robustly parses JSON from a string that might contain markdown blocks or extra text.
 * @param {string} text 
 * @returns {any} Parser result
 * @throws {Error} if parsing fails
 */
function cleanAndParseJSON(text) {
    if (!text) throw new Error("Empty text");

    let clean = text.trim();

    // Remove markdown code blocks (```json ... ```)
    // Match start ```(json)? and end ```
    // We'll just look for the first { and last } to be safe
    const firstBrace = clean.indexOf("{");
    const firstSquare = clean.indexOf("[");

    let start = -1;
    // Determine if it looks like an object or array
    if (firstBrace !== -1 && (firstSquare === -1 || firstBrace < firstSquare)) {
        start = firstBrace;
    } else if (firstSquare !== -1) {
        start = firstSquare;
    }

    if (start !== -1) {
        // Find matching end
        // Basic heuristic: look for last } or ]
        const lastBrace = clean.lastIndexOf("}");
        const lastSquare = clean.lastIndexOf("]");
        let end = Math.max(lastBrace, lastSquare);

        if (end > start) {
            clean = clean.substring(start, end + 1);
        }
    }

    // Escape control characters if necessary (LLMs sometimes outputs raw newlines in strings which is invalid JSON)
    // This is a bit risky but can help. For now, try standard parse.

    try {
        return JSON.parse(clean);
    } catch (e) {
        // Retry with some cleanup for common LLM JSON errors
        // distinct from strict JSON
        const fixed = clean.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
            .replace(/'/g, '"'); // Replace single quotes (risky if content has single quotes)

        // Actually, simple regex fixes are dangerous. Let's just text clean
        // If strict parse failed, throw.
        throw new Error(`JSON parse failed: ${e.message}`);
    }
}

module.exports = { cleanAndParseJSON };
