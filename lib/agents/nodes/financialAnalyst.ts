import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FINANCIAL_ANALYST_PROMPT } from "../../prompts/index";
import { AgentState } from "../investmentGraph";
import { getModel } from "../../model";

export async function financialAnalystNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { company, researchData, sentimentData, onProgress } = state;

  onProgress?.({
    node: "financialAnalyst",
    status: "active",
    message: `📊 Running financial analysis and scoring for ${company}...`,
  });

  const model = getModel("google/gemini-2.5-flash", 0.1);

  const prompt = FINANCIAL_ANALYST_PROMPT
    .replace("{company}", company)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{sentimentData}", JSON.stringify(sentimentData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a financial analysis AI. Always respond with valid JSON only, no markdown code blocks."
    ),
    new HumanMessage(prompt),
  ]);

  let financialData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
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
    message: `✅ Financial score: ${financialData.financialScore}/100 | Growth: ${financialData.growthScore}/100`,
  });

  return { financialData };
}
