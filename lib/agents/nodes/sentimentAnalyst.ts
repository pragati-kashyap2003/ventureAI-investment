import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SENTIMENT_ANALYST_PROMPT } from "../../prompts/index";
import { AgentState } from "../investmentGraph";
import { getModel } from "../../model";

export async function sentimentAnalystNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { company, researchData, onProgress } = state;

  onProgress?.({
    node: "sentimentAnalyst",
    status: "active",
    message: `📰 Analyzing news sentiment and public narrative for ${company}...`,
  });

  const model = getModel("google/gemini-2.5-flash", 0.2);

  const prompt = SENTIMENT_ANALYST_PROMPT
    .replace("{company}", company)
    .replace("{researchData}", JSON.stringify(researchData, null, 2));

  const response = await model.invoke([
    new SystemMessage(
      "You are a sentiment analysis AI. Always respond with valid JSON only, no markdown code blocks."
    ),
    new HumanMessage(prompt),
  ]);

  let sentimentData: Record<string, unknown> = {};
  try {
    const content = typeof response.content === "string" ? response.content : "";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    sentimentData = JSON.parse(cleaned);
  } catch {
    sentimentData = {
      sentimentScore: 50,
      sentimentLabel: "Neutral",
      keyNarratives: ["Analysis in progress"],
      positiveSignals: [],
      negativeSignals: [],
      mediaPresence: "Medium",
      investorSentiment: "Neutral",
    };
  }

  onProgress?.({
    node: "sentimentAnalyst",
    status: "done",
    message: `✅ Sentiment: ${sentimentData.sentimentLabel} (${sentimentData.sentimentScore}/100)`,
  });

  return { sentimentData };
}
