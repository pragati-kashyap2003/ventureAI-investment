import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { WEB_RESEARCHER_PROMPT } from "../../prompts/index";
import { AgentState } from "../investmentGraph";
import { getModel } from "../../model";

async function tavilySearch(query: string): Promise<{ content: string; url: string }[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.warn(`Tavily search failed for: ${query} (${response.status}) ${errorBody}`);
    return [];
  }

  const data = await response.json() as { results?: { content?: string; url?: string }[] };
  return (data.results || []).map((r) => ({
    content: r.content || "",
    url: r.url || "",
  }));
}

export async function webResearcherNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { company, onProgress } = state;

  onProgress?.({
    node: "webResearcher",
    status: "active",
    message: `🔍 Searching the web for "${company}"...`,
  });

  const queries = [
    `${company} company business model revenue 2024 2025`,
    `${company} latest news funding valuation investors`,
    `${company} financial performance growth market competitors`,
  ];

  let allResults: { content: string; url: string }[] = [];

  for (const query of queries) {
    try {
      const results = await tavilySearch(query);
      allResults = [...allResults, ...results];
    } catch (e) {
      console.warn("Search error:", e);
    }
  }

  const sources = [...new Set(allResults.map(r => r.url).filter(Boolean))];
  const rawSearchResults = allResults.map(r => r.content).join("\n\n---\n\n");

  onProgress?.({
    node: "webResearcher",
    status: "active",
    message: `📡 Found ${allResults.length} results. Extracting insights...`,
  });

  // Use a fast model for web research extraction
  const model = getModel("google/gemini-2.5-flash", 0.1);

  const prompt = WEB_RESEARCHER_PROMPT
    .replace("{company}", company)
    .replace("{searchResults}", rawSearchResults.slice(0, 12000));

  const response = await model.invoke([
    new SystemMessage(
      "You are a financial research AI. Always respond with valid JSON only, no markdown code blocks."
    ),
    new HumanMessage(prompt),
  ]);

  let researchData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    researchData = JSON.parse(cleaned);
    researchData.sources = [...new Set([
      ...((researchData.sources as string[]) || []),
      ...sources.slice(0, 6),
    ])];
  } catch {
    researchData = {
      companyOverview: `Research data collected for ${company}`,
      rawData: rawSearchResults.slice(0, 2000),
      sources: sources.slice(0, 6),
    };
  }

  onProgress?.({
    node: "webResearcher",
    status: "done",
    message: `✅ Research complete. Analyzed ${allResults.length} sources.`,
  });

  return { researchData };
}
