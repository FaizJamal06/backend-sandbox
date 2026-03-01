require("dotenv").config();
const { callAI } = require("../ai/groqClient");

async function testGroq() {
    console.log("----------------------------------------");
    console.log("⚡ Testing Groq API Connectivity");
    console.log("----------------------------------------");

    try {
        const prompt = "Reply with 'Hello from Groq!' if you can read this.";
        console.log(`Sending prompt: "${prompt}"...`);

        const start = Date.now();
        const response = await callAI(prompt);
        const duration = Date.now() - start;

        console.log("\n✅ SUCCESS!");
        console.log(`Response Time: ${duration}ms`);
        console.log(`Output: ${response}`);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("\n❌ FAILED");
        console.error(error.message);
        if (error.message.includes("401")) {
            console.error("\n[!] Please ensure your GROQ_API_KEY in .env is correct.");
        }
    }
}

testGroq();
