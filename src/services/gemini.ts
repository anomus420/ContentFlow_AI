import { judgeTopicsWithGroq, writePostWithGroq } from './groq';

// Backwards compatibility alias for Gemini service calls, delegating to Groq LLM
export const judgeTopicsWithGemini = judgeTopicsWithGroq;
export const writePostWithGemini = writePostWithGroq;
