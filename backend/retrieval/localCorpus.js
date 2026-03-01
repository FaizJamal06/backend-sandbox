const fs = require("fs");
const path = require("path");
const config = require("../config");

let corpus = [];

function loadCorpus() {
  if (corpus.length) return corpus;
  const corpusPath = path.resolve(process.cwd(), config.retrieval.corpusPath);
  if (!fs.existsSync(corpusPath)) {
    return corpus;
  }
  try {
    const raw = fs.readFileSync(corpusPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      corpus = parsed
        .map((item) => ({
          title: item.title || "",
          text: item.text || item.snippet || "",
          url: item.url || "",
        }))
        .filter((c) => c.text);
    }
  } catch (err) {
    console.warn("Failed to load corpus", err);
  }
  return corpus;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreOverlap(queryTokens, docTokens) {
  const docSet = new Set(docTokens);
  let overlap = 0;
  for (const t of queryTokens) {
    if (docSet.has(t)) overlap += 1;
  }
  return overlap / Math.max(docTokens.length || 1, 1);
}

function searchLocalCorpus(query, topK = config.retrieval.topK) {
  const data = loadCorpus();
  if (!data.length) return [];
  const qTokens = tokenize(query);
  const scored = data
    .map((doc) => {
      const score = scoreOverlap(qTokens, tokenize(doc.text));
      return { ...doc, score };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored;
}

module.exports = { searchLocalCorpus, loadCorpus };

