const sentenceFeedbackPrompt = (sentence, evidence = []) => `
SYSTEM: You are a concise legal drafting assistant. ALWAYS return valid JSON only.
If evidence is weak or absent, mark support:"UNVERIFIED" and be conservative.

EVIDENCE: ${JSON.stringify(evidence)}
SENTENCE: "${sentence}"

Return JSON exactly:
{
  "clarity": "...",
  "issue": "...",
  "improved_sentence": "...",
  "support": "SUPPORTED|PARTIAL|UNVERIFIED",
  "confidence": 0-1
}`;

const draftFeedbackPrompt = (draft, evidence = [], caseDetails = null) => `
SYSTEM: You are a senior advocate. ALWAYS return valid JSON only.
Compare the DRAFT against the CASE_DATA provided.
1. Check if the draft covers all relevant facts from the case summary.
2. Check if the draft uses correct legal provisions.
3. If unsupported statutes are used, mark as UNVERIFIED.

CASE_DATA:
${caseDetails ? JSON.stringify(caseDetails, null, 2) : "No specific case details provided."}

EVIDENCE_SNIPPETS (Statutes/Case Law): 
${JSON.stringify(evidence)}

DRAFT:
"""
${draft}
"""
Return JSON exactly:
{
  "issues": [
    "List specific missing facts or legal errors...",
    "e.g., 'The draft fails to mention the specific date of purchase (Dec 1, 2024).'"
  ],
  "structure": ["Comment on structure..."],
  "improvements": ["Specific suggestions to align with case facts..."],
  "score": 0-10,
  "confidence": 0-1
}`;

const factExtractionPrompt = (draft) => `
You are a legal fact extraction assistant.
Extract key factual statements (dates, obligations, statutory cites, judgments) from the draft below.
Return ONLY a JSON array of strings, each string is one factual statement.
Draft:
"""
${draft}
"""`;


const realtimeSentencePrompt = (text, context, caseDetails) => {
  const caseData = JSON.stringify(caseDetails || {});
  return `
SYSTEM: You are a Real-Time Legal Editing Assistant.
Your Goal: Identify grammar, clarity, and legal consistency errors in the user's draft.

Context:
- Case Facts: ${caseData}
- Determining if the text segments below contain errors.

Draft Text to Analyze:
"""
${text}
"""

Instructions:
1. Identify SPECIFIC segments that have errors (grammar, ambiguity, unsupported facts).
2. Ignore perfect text.
3. If the same error appears multiple times, list it once per occurrence.
4. Return JSON only.
5. "original" MUST be the EXACT substring from the text.

Output Format:
{
  "issues": [
    { 
      "original": "exact text segment",
      "suggestion": "corrected version",
      "explanation": "why is it wrong (concise)"
    }
  ],
  "severity": "low|medium|high"
}
`;
};

module.exports = {
  sentenceFeedbackPrompt,
  draftFeedbackPrompt,
  factExtractionPrompt,
  realtimeSentencePrompt
};

