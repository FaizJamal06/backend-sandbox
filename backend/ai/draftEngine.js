const { callAI } = require("./groqClient");
const { draftFeedbackPrompt } = require("./prompts");
const { cleanAndParseJSON } = require("../lib/jsonParser");
const { searchLocalCorpus } = require("../retrieval/localCorpus");
const config = require("../config");

async function getDraftFeedback(draft, caseDetails = null) {
  const evidence = searchLocalCorpus(draft, config.retrieval.topK + 2);
  const prompt = draftFeedbackPrompt(
    draft,
    evidence.map((e) => ({ text: e.text, url: e.url, score: e.score })),
    caseDetails
  );
  const raw = await callAI(prompt);
  console.log("Draft Feedback Raw Response:", raw);
  try {
    const parsed = cleanAndParseJSON(raw);
    return {
      issues: parsed.issues ?? [],
      structure: parsed.structure ?? [],
      improvements: parsed.improvements ?? [],
      score: parsed.score ?? 0,
      confidence: parsed.confidence ?? 0,
      evidence,
    };
  } catch (err) {
    console.warn("Draft feedback JSON parse failed, returning fallback", err);
    return {
      issues: ["Model response format was invalid.", "Raw: " + raw.substring(0, 100)],
      structure: [],
      improvements: [],
      score: 0,
      confidence: 0,
      raw,
      evidence,
    };
  }
}

module.exports = { getDraftFeedback };

