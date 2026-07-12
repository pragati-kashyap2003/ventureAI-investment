import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { AgentState } from "../investmentGraph";
import { createStructuredStateUpdate } from "../investmentGraph";
import { getModel } from "../../model";

export interface CompanyCandidate {
  name: string;
  industry: string;
  headquarters: string;
  website: string;
  oneLineDescription: string;
  confidence: number;
}

export interface CompanyResolution {
  status: "RESOLVED" | "AMBIGUOUS" | "NOT_FOUND" | "FAILED";
  companies: CompanyCandidate[];
  explanation?: string;
  resolvedCompany?: string;
}

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
    throw new Error(`Tavily search failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json() as { results?: { content?: string; url?: string }[] };
  return (data.results || []).map((result) => ({
    content: result.content || "",
    url: result.url || "",
  }));
}

function parseResolution(raw: string): CompanyResolution {
  const cleaned = raw
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<CompanyResolution> & { companies?: CompanyCandidate[] };
    return {
      status: parsed.status || "FAILED",
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      explanation: parsed.explanation,
      resolvedCompany: parsed.resolvedCompany,
    };
  } catch {
    return { status: "FAILED", companies: [], explanation: "Unable to parse resolver output." };
  }
}

export async function companyResolverNode(state: AgentState): Promise<Partial<AgentState>> {
  const companyInput = state.companyInput?.trim() || "";
  const { onProgress } = state;

  onProgress?.({
    node: "companyResolver",
    status: "active",
    message: `🔎 Resolving the target company for "${companyInput}"...`,
  });

  if (!companyInput) {
    return createStructuredStateUpdate(state, {
      resolvedCompany: "",
      companyCandidates: [],
      resolutionStatus: "NOT_FOUND",
      progress: [...(state.progress || [])],
    });
  }

  const queries = [
    `${companyInput} company`,
    `${companyInput} startup`,
    `${companyInput} Crunchbase`,
    `${companyInput} LinkedIn`,
  ];

  let searchResults: { content: string; url: string }[] = [];
  let lastError: string | undefined;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const collected: { content: string; url: string }[] = [];
      for (const query of queries) {
        const results = await tavilySearch(query);
        collected.push(...results);
      }
      searchResults = collected;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Tavily failure";
    }
  }

  if (searchResults.length === 0) {
    onProgress?.({
      node: "companyResolver",
      status: "done",
      message: `Proceeding with "${companyInput}" (search unavailable, using input as-is)`,
    });

    return createStructuredStateUpdate(state, {
      resolvedCompany: companyInput,
      companyCandidates: [],
      resolutionStatus: "RESOLVED",
      progress: [...(state.progress || [])],
    });
  }

  const model = getModel("google/gemini-2.5-flash", 0.05, 1800);
  const prompt = `You are a company resolution assistant. Analyze the provided search snippets and identify the most likely company.

Company input: ${companyInput}

Search snippets:
${searchResults.map((result) => `${result.url}\n${result.content}`).join("\n\n---\n\n").slice(0, 14000)}

Return strict JSON only.
{
  "status": "RESOLVED" | "AMBIGUOUS" | "NOT_FOUND" | "FAILED",
  "companies": [
    {
      "name": "string",
      "industry": "string",
      "headquarters": "string",
      "website": "string",
      "oneLineDescription": "string",
      "confidence": 0
    }
  ],
  "resolvedCompany": "string",
  "explanation": "string"
}`;

  const response = await model.invoke([
    new SystemMessage("You are a company resolver. Return strict JSON only."),
    new HumanMessage(prompt),
  ]);

  const content = typeof response.content === "string" ? response.content : "";
  const resolution = parseResolution(content);

  if (resolution.status === "RESOLVED" && resolution.resolvedCompany) {
    onProgress?.({
      node: "companyResolver",
      status: "done",
      message: `✅ Resolved company to ${resolution.resolvedCompany}`,
    });

    return createStructuredStateUpdate(state, {
      resolvedCompany: resolution.resolvedCompany,
      companyCandidates: resolution.companies || [],
      resolutionStatus: resolution.status,
      progress: [...(state.progress || [])],
    });
  }

  if (resolution.status === "AMBIGUOUS") {
    onProgress?.({
      node: "companyResolver",
      status: "done",
      message: `⚠️ Multiple possible companies found for "${companyInput}"`,
    });

    return createStructuredStateUpdate(state, {
      resolvedCompany: companyInput,
      companyCandidates: resolution.companies || [],
      resolutionStatus: resolution.status,
      progress: [...(state.progress || [])],
    });
  }

  if (resolution.status === "NOT_FOUND" || resolution.status === "FAILED") {
    onProgress?.({
      node: "companyResolver",
      status: "done",
      message: `Proceeding with "${companyInput}" as entered`,
    });

    return createStructuredStateUpdate(state, {
      resolvedCompany: companyInput,
      companyCandidates: [],
      resolutionStatus: "RESOLVED",
      progress: [...(state.progress || [])],
    });
  }

  onProgress?.({
    node: "companyResolver",
    status: "done",
    message: `Proceeding with "${companyInput}" as entered`,
  });

  return createStructuredStateUpdate(state, {
    resolvedCompany: companyInput,
    companyCandidates: [],
    resolutionStatus: "RESOLVED",
    progress: [...(state.progress || [])],
  });
}
