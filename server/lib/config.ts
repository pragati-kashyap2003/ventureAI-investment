export function hasApiKeys(): boolean {
  const openrouter = process.env.OPENROUTER_API_KEY;
  const tavily = process.env.TAVILY_API_KEY;
  return Boolean(
    openrouter &&
      openrouter !== "your_openrouter_api_key_here" &&
      tavily &&
      tavily !== "your_tavily_api_key_here"
  );
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true" || !hasApiKeys();
}

export function getVerdictModel(): string {
  return process.env.OPENROUTER_VERDICT_MODEL || "google/gemini-2.5-flash";
}
