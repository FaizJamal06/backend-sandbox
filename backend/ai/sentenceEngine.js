const { callAI } = require("./groqClient");
const { sentenceFeedbackPrompt } = require("./prompts");
const { cleanAndParseJSON } = require("../lib/jsonParser");
const { searchLocalCorpus } = require("../retrieval/localCorpus");
const config = require("../config");

async function getSentenceFeedback(sentence) {
  const evidence = searchLocalCorpus(sentence, config.retrieval.topK);
  const prompt = sentenceFeedbackPrompt(
    sentence,
    evidence.map((e) => ({ text: e.text, url: e.url, score: e.score }))
  );
  const raw = await callAI(prompt);
  try {
    const parsed = cleanAndParseJSON(raw);
    return {
      sentence,
      clarity: parsed.clarity ?? "",
      issue: parsed.issue ?? "",
      improved_sentence: parsed.improved_sentence ?? "",
      support: parsed.support ?? "UNVERIFIED",
      confidence: parsed.confidence ?? 0,
      evidence,
    };
  } catch (err) {
    console.warn("Sentence feedback JSON parse failed, returning fallback", err);
    return {
      sentence,
      clarity: "Could not parse model response.",
      issue: "",
      improved_sentence: "",
      support: "UNVERIFIED",
      confidence: 0,
      raw,
      evidence,
    };
  }
}

module.exports = { getSentenceFeedback };

