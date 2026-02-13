/**
 * AI Provider Abstraction Layer
 * Supports: Gemini (Google), Groq (Llama)
 * Switch via AI_PROVIDER env variable
 */

const provider = process.env.AI_PROVIDER || "gemini";

let aiModule;

switch (provider.toLowerCase()) {
  case "groq":
    aiModule = require("./groq");
    console.log("✅ AI Provider: Groq (Llama 3.3 70B)");
    break;
  case "gemini":
  default:
    aiModule = require("./gemini");
    console.log("✅ AI Provider: Gemini (gemini-2.0-flash)");
    break;
}

module.exports = aiModule;
