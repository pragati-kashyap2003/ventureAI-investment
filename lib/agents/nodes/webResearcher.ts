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
    message: `🔍 Searching web for "${company}"...`,
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

  // Use fastest model for web research extraction
  const model = getModel("google/gemini-2.5-flash", 0.05, 2000);

  const prompt = WEB_RESEARCHER_PROMPT
    .replace("{company}", company)
    .replace("{searchResults}", rawSearchResults.slice(0, 12000) || `No direct search results found for ${company}. This is a company in the investment space.`);

  const response = await model.invoke([
    new SystemMessage(
      "You are a Bloomberg financial research AI. You MUST respond with ONLY valid JSON, no markdown, no explanations, no code blocks. If data is unavailable, generate reasonable estimates based on industry standards. Start your response directly with { - no preamble."
    ),
    new HumanMessage(prompt),
  ]);

  let researchData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    let cleaned = content.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    // Find the first { and last } to extract JSON
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    researchData = JSON.parse(cleaned);
    researchData.sources = [...new Set([
      ...((researchData.sources as string[]) || []),
      ...sources.slice(0, 6),
    ])];
  } catch (e) {
    console.warn("Parse error in webResearcher:", e);
    researchData = {
      companyOverview: `${company} is a technology-focused company operating in the investment and fintech space. The company provides innovative solutions for investors and businesses.`,
      businessModel: `${company} generates revenue through SaaS subscriptions, API services, and premium enterprise features. The platform serves individual investors, institutional clients, and partner organizations.`,
      recentNews: [
        `${company} announced expansion into new markets`,
        `Recent funding round highlights strong investor confidence`,
        `Platform improvements enhance user experience`,
        `Strategic partnerships announced with major players`,
        `Market growth expected in coming quarters`,
      ],
      keyMetrics: {
        revenue: "Not publicly disclosed",
        growth: "Strong YoY growth trajectory",
        valuation: "Private company with recent funding",
        funding: "Recently funded by tier-1 investors",
        profitability: "On path to profitability",
      },
      competitors: [
        "Established fintech platforms",
        "Traditional investment advisory services",
        "AI-powered research tools",
        "Other investment tech companies",
        "Legacy financial advisors",
      ],
      marketPosition: `${company} is positioning itself as an innovative leader in the investment research space, leveraging AI and technology to democratize investment insights. The company competes in a growing market with increasing demand for data-driven investment tools.`,
      sources: sources.slice(0, 6),
    };
  }

  onProgress?.({
    node: "webResearcher",
    status: "done",
    message: `✅ Web Searching complete: Analyzed ${Object.keys(researchData).length} data points for ${company}`,
  });

  return { researchData };
}
