const express = require("express");
const { getSentenceFeedback } = require("../ai/sentenceEngine");
const { getDraftFeedback } = require("../ai/draftEngine");
const { verifyFacts } = require("../factcheck/verifyFacts");
const { getRealtimeFeedback } = require("../ai/realtimeEngine");

const router = express.Router();

router.post("/sentence", async (req, res) => {
  const { sentence } = req.body || {};
  if (!sentence || !sentence.trim()) {
    return res.status(400).json({ error: "sentence is required" });
  }
  try {
    const feedback = await getSentenceFeedback(sentence.trim());
    res.json({ sentenceFeedback: feedback, meta: { llm_calls: 1 } });
  } catch (err) {
    console.error("Sentence feedback error:", err);
    res.status(500).json({ error: "Failed to process sentence feedback" });
  }
});

router.post("/realtime", async (req, res) => {
  const { sentence, partialDraft, caseDetails } = req.body;
  if (!sentence) return res.status(400).json({ error: "Missing sentence" });

  try {
    const feedback = await getRealtimeFeedback(sentence, partialDraft, caseDetails);
    res.json(feedback);
  } catch (error) {
    console.error("Realtime API Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/draft", async (req, res) => {
  const { draft, moduleId, questionId, caseDetails } = req.body || {};
  console.log("--> Received draft for evaluation:", draft ? draft.substring(0, 50) + "..." : "EMPTY");

  if (!draft || !draft.trim()) {
    return res.status(400).json({ error: "draft is required" });
  }
  try {
    console.log("Starting parallel evaluation tasks...");

    // Execute sequentially to avoid Rate Limits (429) on free tier
    console.log("Step 1/3: Getting Draft Feedback...");
    const draftFeedback = await getDraftFeedback(draft, caseDetails);

    console.log("Step 2/3: Verifying Facts...");
    const factCheck = await verifyFacts(draft);

    console.log("Step 3/3: Analyzing Sentence...");
    const lastSent = lastSentence(draft);
    const sentenceFeedback = await getSentenceFeedback(lastSent);
    console.log("All evaluation tasks completed.");

    res.json({
      moduleId,
      questionId,
      sentenceFeedback,
      draftFeedback,
      factCheck,
      meta: {
        llm_calls: 2,
        verifier_calls: factCheck.length,
      },
    });
  } catch (err) {
    console.error("Draft feedback error:", err);
    res.status(500).json({ error: "Failed to process draft feedback" });
  }
});

function lastSentence(text) {
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim());
  return sentences.filter(Boolean).pop() || text.trim();
}

module.exports = router;

