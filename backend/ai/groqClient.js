const config = require("../config");
const { LRUCache } = require("../lib/cache");

const cache = new LRUCache(config.cache.maxEntries, config.cache.ttlMs);

const API_KEY = config.groq.apiKey;
const API_URL = config.groq.url;
const MODEL = config.groq.model;

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

async function callAI(prompt) {
    if (!API_KEY) {
        throw new Error("Missing GROQ_API_KEY. Please check your .env or config.");
    }

    const cacheKey = `groq:${MODEL}:${prompt}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    console.log(`--> Sending prompt to Groq (${MODEL})...`);

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
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1, // Groq/Llama works better with low temp for logic
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const text = await res.text();
                if (res.status === 429) {
                    console.warn(`x Rate Limited (Groq 429). Waiting before retry ${attempt}/${MAX_RETRIES}...`);
                    const delay = 2000 * attempt;
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                if (res.status >= 500) {
                    throw new Error(`Groq Server Error: ${res.status}`);
                }
                throw new Error(`Groq API Error: ${res.status} ${text}`);
            }

            const data = await res.json();
            console.log(`<-- Groq response received`);
            const output = data.choices?.[0]?.message?.content || "";

            cache.set(cacheKey, output);
            return output;

        } catch (error) {
            console.warn(`x Attempt ${attempt} failed: ${error.message}`);
            if (attempt === MAX_RETRIES) throw error;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
    throw new Error("All Groq retries failed.");
}

module.exports = { callAI };
