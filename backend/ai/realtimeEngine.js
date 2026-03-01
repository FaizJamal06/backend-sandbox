const { callAI } = require("./groqClient");
const { realtimeSentencePrompt } = require("./prompts");
const { cleanAndParseJSON } = require("../lib/jsonParser");

async function getRealtimeFeedback(sentence, partialDraft, caseDetails) {
    // If sentence is too short, ignore
    if (!sentence || sentence.length < 10) return { issues: [], suggestions: [], severity: "low" };

    try {
        const prompt = realtimeSentencePrompt(sentence, partialDraft, caseDetails);

        // Call AI (Groq is fast)
        const rawResponse = await callAI(prompt);

        // Parse
        const result = cleanAndParseJSON(rawResponse);

        // Ensure structure
        return {
            issues: Array.isArray(result.issues) ? result.issues : [],
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
            severity: result.severity || "low"
        };

    } catch (error) {
        console.error("Realtime feedback error:", error);
        // Return safe fallback
        return { issues: [], suggestions: [], severity: "low" };
    }
}

module.exports = { getRealtimeFeedback };
