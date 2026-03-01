const { extractFactualStatements } = require("./extractFacts");
const { searchWeb } = require("./searchEngine");
const { searchLocalCorpus } = require("../retrieval/localCorpus");
const config = require("../config");

async function verifyFacts(text) {
  const statements = await extractFactualStatements(text);
  const factChecks = [];

  for (const statement of statements) {
    try {
      const localEvidence = searchLocalCorpus(statement, config.retrieval.topK);
      const results = localEvidence.length ? localEvidence : await searchWeb(statement);
      const supported = computeSupport(statement, results);
      factChecks.push({
        statement,
        supported: supported === "SUPPORTED",
        support: supported,
        sources: results.map((r) => r.url || r.title).filter(Boolean),
        snippets: results.map((r) => r.snippet || r.text || r.title).filter(Boolean),
      });
    } catch (err) {
      factChecks.push({
        statement,
        supported: false,
        sources: [],
        snippets: [],
        error: err.message,
      });
    }
  }

  return factChecks;
}

function computeSupport(statement, evidence) {
  if (!evidence || !evidence.length) return "UNVERIFIED";
  const qTokens = new Set(
    statement
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  let bestOverlap = 0;
  for (const e of evidence) {
    const text = (e.text || e.snippet || e.title || "").toLowerCase();
    const tokens = new Set(text.split(/\s+/).filter(Boolean));
    let overlap = 0;
    qTokens.forEach((t) => {
      if (tokens.has(t)) overlap += 1;
    });
    bestOverlap = Math.max(bestOverlap, overlap / Math.max(tokens.size || 1, 1));
  }
  if (bestOverlap >= config.thresholds.verifierGood) return "SUPPORTED";
  if (bestOverlap >= config.thresholds.verifierPartial) return "PARTIAL";
  return "UNVERIFIED";
}

module.exports = { verifyFacts };

