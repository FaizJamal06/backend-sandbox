const DDG_URL = "https://api.duckduckgo.com/";
const { LRUCache } = require("../lib/cache");
const config = require("../config");

const cache = new LRUCache(config.cache.maxEntries, config.cache.ttlMs);

async function searchWeb(query) {
  const cached = cache.get(query);
  if (cached) return cached;

  const url = `${DDG_URL}?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
  console.log(`Searching web: "${query}"...`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Search failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    console.log(`Search result for "${query}":`, data.Heading || "No Heading");
    const topics = data.RelatedTopics ?? [];
    const results = topics
      .map((t) => {
        if (t.Text && t.FirstURL) {
          return { title: t.Text.slice(0, 200), url: t.FirstURL };
        }
        if (Array.isArray(t.Topics)) {
          const inner = t.Topics.find((x) => x.Text && x.FirstURL);
          if (inner) return { title: inner.Text.slice(0, 200), url: inner.FirstURL };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 3);
    if (data.AbstractText) {
      results.unshift({
        title: data.Heading || query,
        snippet: data.AbstractText.slice(0, 280),
        url: data.AbstractURL || "",
      });
    }
    cache.set(query, results);
    return results;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`Search timeout for "${query}"`);
    } else {
      console.error(`Search error for "${query}":`, err.message);
    }
    return [];
  }
}

module.exports = { searchWeb };

