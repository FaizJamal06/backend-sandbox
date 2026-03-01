require("dotenv").config();
const config = require("../config");

const API_KEY = config.openRouter.apiKey;
const MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free",
    "microsoft/phi-3-mini-128k-instruct:free"
];

async function checkModels() {
    console.log("----------------------------------------");
    console.log("🕵️ Checking Model Availability");
    console.log("----------------------------------------");

    for (const model of MODELS) {
        process.stdout.write(`Testing ${model} ... `);
        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "http://localhost:4000",
                    "X-Title": "CheckScript"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Hi" }],
                }),
            });

            if (res.ok) {
                console.log("✅ OK");
            } else {
                const text = await res.text();
                console.log(`❌ ERROR ${res.status}`);
                // console.log(text); // hiding verbose for now
            }
        } catch (err) {
            console.log(`❌ NETWORK ERR`);
        }
        // minimal delay
        await new Promise(r => setTimeout(r, 1000));
    }
}

checkModels();
