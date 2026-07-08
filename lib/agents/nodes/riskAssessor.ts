import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RISK_ASSESSOR_PROMPT } from "../../prompts/index";
import { AgentState } from "../investmentGraph";
import { getModel } from "../../model";

export async function riskAssessorNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { company, researchData, financialData, onProgress } = state;

  onProgress?.({
    node: "riskAssessor",
    status: "active",
    message: `⚠️ Assessing market, competitive, and regulatory risks for ${company}...`,
  });

  const model = getModel("google/gemini-2.5-flash", 0.15, 1800);

  const prompt = RISK_ASSESSOR_PROMPT
    .replace("{company}", company)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{financialData}", JSON.stringify(financialData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a Bloomberg risk strategist. You MUST respond with ONLY valid JSON, no markdown, no explanations. Be thorough in risk identification. Start your response directly with { - no preamble."
    ),
    new HumanMessage(prompt),
  ]);

  let riskData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    riskData = JSON.parse(cleaned);
  } catch {
    riskData = {
      riskScore: 50,
      overallRiskLevel: "Medium",
      marketRisks: [],
      competitiveRisks: [],
      regulatoryRisks: [],
      operationalRisks: [],
      redFlags: [],
      mitigatingFactors: [],
    };
  }

  onProgress?.({
    node: "riskAssessor",
    status: "done",
    message: `✅ Risk assessment complete: ${riskData.overallRiskLevel} risk | Score ${riskData.riskScore}/100`,
  });

  return { riskData };
}
