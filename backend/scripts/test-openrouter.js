require("dotenv").config();
const { callAI } = require("../ai/openrouterClient");
const config = require("../config");

async function testConnection() {
    console.log("----------------------------------------");
    console.log("🧪 Testing OpenRouter Connection");
    console.log("----------------------------------------");
    console.log(`URL: ${config.openRouter.url}`);
    console.log(`Model: ${config.openRouter.model}`);
    console.log(`API Key set? ${config.openRouter.apiKey ? "YES (Length: " + config.openRouter.apiKey.length + ")" : "NO"}`);
    console.log("----------------------------------------");

    if (!config.openRouter.apiKey) {
        console.error("❌ ERROR: OPENROUTER_API_KEY is not set.");
        console.error("Please create a .env file in the backend folder with: OPENROUTER_API_KEY=your_key");
        process.exit(1);
    }

    try {
        const prompt = "Reply with 'Hello from OpenRouter!' if you can read this.";
        console.log(`Sending test prompt: "${prompt}"...`);

        const start = Date.now();
        const response = await callAI(prompt);
        const duration = Date.now() - start;

        console.log("----------------------------------------");
        console.log("✅ SUCCESS!");
        console.log(`Response: ${response}`);
        console.log(`Latency: ${duration}ms`);
        console.log("----------------------------------------");
    } catch (err) {
        console.error("----------------------------------------");
        console.error("❌ CONNECTION FAILED");
        console.error(err.message);
        console.error("----------------------------------------");
        process.exit(1);
    }
}

testConnection();
