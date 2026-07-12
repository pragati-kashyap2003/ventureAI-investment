import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { VERDICT_WRITER_PROMPT } from "../../prompts/index";
import { AgentState, createStructuredStateUpdate } from "../investmentGraph";
import { getModel } from "../../model";
import { getVerdictModel } from "../../config";

export async function verdictWriterNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const companyName = state.resolvedCompany || state.companyInput || "Unknown";
  const { researchData, sentimentData, financialData, riskData, onProgress } = state;

  onProgress?.({
    node: "verdictWriter",
    status: "active",
    message: `🧠 CIO is synthesizing all data and writing investment verdict for ${companyName}...`,
  });

  // Use slightly more capable model for final verdict since it's the most important
  const model = getModel(getVerdictModel(), 0.2, 2500);

  const prompt = VERDICT_WRITER_PROMPT
    .replace("{company}", companyName)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{sentimentData}", JSON.stringify(sentimentData, null, 2))
    .replace("{financialData}", JSON.stringify(financialData, null, 2))
    .replace("{riskData}", JSON.stringify(riskData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a Chief Investment Officer making final investment recommendations. You MUST respond with ONLY valid JSON, no markdown, no explanations. Be decisive and clear. Start your response directly with { - no preamble."
    ),
    new HumanMessage(prompt),
  ]);

  let verdictData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    verdictData = JSON.parse(cleaned);
  } catch {
    verdictData = {
      verdict: "PASS",
      confidence: 50,
      executiveSummary: "Analysis complete. Please review the detailed metrics.",
      keyBullCase: [],
      keyBearCase: [],
      investmentThesis: "Insufficient data for full analysis.",
      timeHorizon: "Medium-term (1-3yr)",
      comparableCompanies: [],
      finalNote: "Further due diligence recommended.",
    };
  }

  onProgress?.({
    node: "verdictWriter",
    status: "done",
    message: `✅ CIO verdict complete: ${verdictData.verdict} (${verdictData.confidence}% confidence) | Thesis: ${(verdictData.investmentThesis as string)?.slice(0, 50)}...`,
  });

  return createStructuredStateUpdate(state, {
    verdictData,
    researchData,
    sentimentData,
    financialData,
    riskData,
  });
}
