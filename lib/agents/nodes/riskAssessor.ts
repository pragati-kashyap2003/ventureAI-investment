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

  const model = getModel("google/gemini-2.5-flash", 0.2);

  const prompt = RISK_ASSESSOR_PROMPT
    .replace("{company}", company)
    .replace("{researchData}", JSON.stringify(researchData, null, 2))
    .replace("{financialData}", JSON.stringify(financialData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a risk assessment AI. Always respond with valid JSON only, no markdown code blocks."
    ),
    new HumanMessage(prompt),
  ]);

  let riskData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
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
    message: `✅ Risk level: ${riskData.overallRiskLevel} | Risk score: ${riskData.riskScore}/100`,
  });

  return { riskData };
}
