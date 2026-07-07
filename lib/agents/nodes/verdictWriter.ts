import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { VERDICT_WRITER_PROMPT } from "../../prompts/index";
import { AgentState } from "../investmentGraph";
import { getModel } from "../../model";

export async function verdictWriterNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { company, researchData, sentimentData, financialData, riskData, onProgress } = state;

  onProgress?.({
    node: "verdictWriter",
    status: "active",
    message: `🧠 CIO is synthesizing all data and writing investment verdict for ${company}...`,
  });

  // Use a more capable model for the final verdict — the most important output
  const model = getModel(
    process.env.OPENROUTER_VERDICT_MODEL || "anthropic/claude-haiku-4.5",
    0.3
  );

  const prompt = VERDICT_WRITER_PROMPT
    .replace("{company}", company)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{sentimentData}", JSON.stringify(sentimentData, null, 2))
    .replace("{financialData}", JSON.stringify(financialData, null, 2))
    .replace("{riskData}", JSON.stringify(riskData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a Chief Investment Officer AI. Always respond with valid JSON only, no markdown code blocks. Be decisive and confident in your verdict."
    ),
    new HumanMessage(prompt),
  ]);

  let verdictData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
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
    message: `✅ Verdict: ${verdictData.verdict} with ${verdictData.confidence}% confidence`,
  });

  return { verdictData };
}
