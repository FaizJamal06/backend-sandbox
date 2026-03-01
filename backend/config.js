module.exports = {
  port: process.env.PORT || 4000,
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: process.env.GROQ_API_KEY || "",
    model: "llama-3.3-70b-versatile", // Fast and capable
  },
  retrieval: {
    corpusPath: process.env.LEGAL_CORPUS_PATH || "data/legal_corpus.json",
    topK: 3,
  },
  cache: {
    maxEntries: Number(process.env.CACHE_MAX || 200),
    ttlMs: Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000),
  },
  thresholds: {
    highSupport: 0.78,
    verifierGood: 0.85,
    verifierPartial: 0.5,
  },
};

