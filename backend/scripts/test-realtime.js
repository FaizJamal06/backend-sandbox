require("dotenv").config();
const { getRealtimeFeedback } = require("../ai/realtimeEngine");

async function testRealtime() {
    console.log("----------------------------------------");
    console.log("⚡ Testing Real-Time Feedback Engine");
    console.log("----------------------------------------");

    const sentence = "The petitioner has filed the complaint on 32th Jan 2025."; // Obvious error
    const partialDraft = "This is a consumer complaint regarding a telecom dispute.";
    const caseDetails = {
        summary: "Telecom dispute regarding overcharging.",
        timeline: [{ date: "2024-01-01", event: "Bill generated" }]
    };

    try {
        console.log(`Analyzing Sentence: "${sentence}"`);
        const start = Date.now();

        const result = await getRealtimeFeedback(sentence, partialDraft, caseDetails);

        console.log(`Time: ${Date.now() - start}ms`);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.issues.length > 0) {
            console.log("\n✅ SUCCESS: Issues detected.");
        } else {
            console.log("\n⚠️ WARNING: No issues detected (Model might be too lenient or key missing).");
        }

    } catch (error) {
        console.error("\n❌ FAILED");
        console.error(error);
    }
}

testRealtime();
