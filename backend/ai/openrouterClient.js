const config = require("../config");
const { LRUCache } = require("../lib/cache");

const cache = new LRUCache(config.cache.maxEntries, config.cache.ttlMs);

const API_KEY = config.openRouter.apiKey;
const API_URL = config.openRouter.url;

// Primary model from config. Sequential execution in feedback.js handles 429 prevention.
const MODEL = config.openRouter.model;

const MAX_RETRIES = 5; // Keep retries for network glitches
const TIMEOUT_MS = 60000;

async function callAI(prompt) {
    if (!API_KEY) {
        throw new Error("Missing OPENROUTER_API_KEY. Please check your .env or config.");
    }

    const cacheKey = `openrouter:${MODEL}:${prompt}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    console.log(`--> Sending prompt to OpenRouter (${MODEL})...`);

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        attempt++;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "http://localhost:4000",
                    "X-Title": "LegalDraftingSandbox"
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const text = await res.text();
                if (res.status === 429) {
                    console.warn(`x Rate Limited (429). Waiting before retry ${attempt}/${MAX_RETRIES}...`);
                    // 429? Wait longer. 5s, 10s, 20s...
                    const delay = 5000 * Math.pow(2, attempt - 1);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                if (res.status >= 500) {
                    throw new Error(`Server Error: ${res.status}`);
                }
                throw new Error(`API Error: ${res.status} ${text}`);
            }

            const data = await res.json();
            console.log(`<-- OpenRouter response received`);
            const output = data.choices?.[0]?.message?.content || "";

            cache.set(cacheKey, output);
            return output;

        } catch (error) {
            console.warn(`x Attempt ${attempt} failed: ${error.message}`);
            if (attempt === MAX_RETRIES) throw error;
            // Standard backoff for network errors
            await new Promise(r => setTimeout(r, 2000 * attempt));
        }
    }
    throw new Error("All AI model retries failed. Service temporarily unavailable.");
}

module.exports = { callAI };
