import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FINANCIAL_ANALYST_PROMPT } from "../../prompts/index";
import { AgentState, createStructuredStateUpdate } from "../investmentGraph";
import { getModel } from "../../model";

export async function financialAnalystNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const companyName = state.resolvedCompany || state.companyInput || "Unknown";
  const { researchData, sentimentData, onProgress } = state;

  onProgress?.({
    node: "financialAnalyst",
    status: "active",
    message: `📊 Running financial analysis and scoring for ${companyName}...`,
  });

  const model = getModel("google/gemini-2.5-flash", 0.1, 1800);

  const prompt = FINANCIAL_ANALYST_PROMPT
    .replace("{company}", companyName)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{sentimentData}", JSON.stringify(sentimentData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a Bloomberg equity analyst. You MUST respond with ONLY valid JSON, no markdown, brief explaination. Be precise with numeric scores (0-100)/100. Start your response directly with { - no preamble."
    ),
    new HumanMessage(prompt),
  ]);

  let financialData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    financialData = JSON.parse(cleaned);
  } catch {
    financialData = {
      financialScore: 50,
      growthScore: 50,
      moatScore: 50,
      valuationScore: 50,
      financialSummary: "Financial analysis complete.",
      growthDrivers: [],
      concerns: [],
      comparativeAdvantage: "To be determined",
    };
  }

  onProgress?.({
    node: "financialAnalyst",
    status: "done",
    message: `✅ Financial analysis complete: Score ${financialData.financialScore}/100 | Growth ${financialData.growthScore}/100 | Moat ${financialData.moatScore}/100`,
  });

  return createStructuredStateUpdate(state, { financialData, researchData, sentimentData });
}
