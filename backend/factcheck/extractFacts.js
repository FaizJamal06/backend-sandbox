const { callAI } = require("../ai/groqClient");
const { factExtractionPrompt } = require("../ai/prompts");
const { cleanAndParseJSON } = require("../lib/jsonParser");

async function extractFactsWithModel(text) {
  const prompt = factExtractionPrompt(text);
  const raw = await callAI(prompt);
  try {
    const parsed = cleanAndParseJSON(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fall through */
  }
  return [];
}

function extractFactsHeuristic(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  return sentences.filter((s) => /[0-9]/.test(s) || /shall|must|within/i.test(s)).slice(0, 10);
}

async function extractFactualStatements(text) {
  const modelFacts = await extractFactsWithModel(text);
  if (modelFacts.length) return modelFacts.slice(0, 10);
  return extractFactsHeuristic(text);
}

module.exports = { extractFactualStatements };

