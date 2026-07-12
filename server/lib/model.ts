import { ChatOpenAI } from "@langchain/openai";

/**
 * Creates a ChatOpenAI model pointed at OpenRouter.
 * OpenRouter is OpenAI-API-compatible, so we just override the base URL.
 *
 * @param model - Any model slug from openrouter.ai/models
 *                e.g. "google/gemini-2.5-flash", "meta-llama/llama-3.1-70b-instruct"
 *                     "anthropic/claude-3.5-sonnet", "openai/gpt-4o"
 * @param temperature
 * @param maxTokens - Capped well below OpenRouter free-tier credit limits to avoid 402 errors
 */
export function getModel(model?: string, temperature = 0.2, maxTokens = 4096) {
  const modelName = model || process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.5-flash";
  
  return new ChatOpenAI({
    modelName,
    temperature,
    maxTokens,
    apiKey: process.env.OPENROUTER_API_KEY!,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://venturescope.ai",
        "X-Title": "VentureScope AI",
      },
    },
  });
}